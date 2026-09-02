import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import App from '../App';
import Intro from './Intro';
import Hub from './Hub';
import DeckBuilder from './DeckBuilder';
import ArenaSelect from './ArenaSelect';
import Lobby from './Lobby';
import Duel from './Duel';
import Result from './Result';

import { ARENAS } from '../game/arenas';
import { DEFAULT_DECK, ALL_CARDS } from '../game/cards';
import { createDuel, endTurn, maskFor, playCard } from '../game/engine';

const noop = () => {};
// React's server renderer splits adjacent text with comment markers.
const render = (el) => renderToString(el).replace(/<!-- -->/g, '');
const duel = createDuel({
  arena: ARENAS[0],
  p1Name: 'Ada',
  p1Deck: DEFAULT_DECK,
  p2Name: 'Rival',
  p2Deck: DEFAULT_DECK
});

describe('screens render without crashing', () => {
  test('app boots to the intro', () => {
    expect(render(<App />)).toContain('AI Architect');
  });

  test('intro', () => {
    expect(render(<Intro username="Ada" setUsername={noop} onDone={noop} />)).toBeTruthy();
  });

  test('hub', () => {
    const html = render(
      <Hub
        username="Ada"
        level={2}
        xp={250}
        unlockedCount={7}
        totalCards={ALL_CARDS.length}
        deckSize={6}
        onSolo={noop}
        onHost={noop}
        onJoin={noop}
        onDeck={noop}
      />
    );
    expect(html).toContain('Play a friend');
  });

  test('deck builder', () => {
    expect(
      render(
        <DeckBuilder deck={DEFAULT_DECK} unlockedIds={DEFAULT_DECK} onToggle={noop} onBack={noop} />
      )
    ).toBeTruthy();
  });

  test('arena select', () => {
    expect(render(<ArenaSelect arenas={ARENAS} purpose="SOLO" onPick={noop} onBack={noop} />)).toContain(
      ARENAS[0].name
    );
  });

  test('lobby as host and as guest', () => {
    const host = render(
      <Lobby
        net={{ role: 'host', status: 'waiting', code: 'ABCDE', error: '', opponent: null }}
        arena={ARENAS[0]}
        role="host"
        username="Ada"
        onStart={noop}
        onCancel={noop}
      />
    );
    expect(host).toContain('ABCDE');

    const guest = render(
      <Lobby
        net={{ role: 'guest', status: 'ready', code: 'ABCDE', error: '', opponent: 'Ada' }}
        arena={ARENAS[0]}
        role="guest"
        username="Bo"
        onStart={noop}
        onCancel={noop}
      />
    );
    expect(guest).toBeTruthy();
  });

  test('duel from both seats, including a masked guest view', () => {
    const asHost = render(
      <Duel
        duel={duel}
        mySide="p1"
        mode="SOLO"
        botThinking={false}
        opponentGone={false}
        onPlay={noop}
        onSkipTurn={noop}
        onLeave={noop}
      />
    );
    expect(asHost).toContain('Your model');

    // The guest only ever receives a masked state, where the opponent's hand
    // is an empty array plus a count.
    const asGuest = render(
      <Duel
        duel={maskFor(duel, 'p2')}
        mySide="p2"
        mode="ONLINE"
        botThinking={false}
        opponentGone={false}
        onPlay={noop}
        onSkipTurn={noop}
        onLeave={noop}
      />
    );
    expect(asGuest).toContain('holds 5 cards');
  });

  test('result screen after a finished duel', () => {
    let finished = { ...duel };
    finished.p1.metrics.score = ARENAS[0].targetScore;
    finished = endTurn(finished, 'p1');

    const html = render(
      <Result
        duel={finished}
        mySide="p1"
        mode="SOLO"
        rewardCard={ALL_CARDS.find((c) => !c.unlockedDefault)}
        level={2}
        xp={250}
        onContinue={noop}
      />
    );
    expect(html).toContain('You win');
  });

  test('a played card shows up in the pipeline', () => {
    const card = duel.p1.hand.find((c) => c.type !== 'SABOTAGE' && c.cost <= duel.p1.energy);
    const next = playCard(duel, 'p1', card.instanceId);
    const html = render(
      <Duel
        duel={next}
        mySide="p1"
        mode="SOLO"
        botThinking={false}
        opponentGone={false}
        onPlay={noop}
        onSkipTurn={noop}
        onLeave={noop}
      />
    );
    expect(html).toContain(card.shortName);
  });
});
