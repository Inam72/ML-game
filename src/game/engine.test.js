import { describe, expect, test } from 'vitest';
import { createDuel, endTurn, maskFor, playCard } from './engine';
import { ARENAS } from './arenas';
import { DEFAULT_DECK } from './cards';

const arena = ARENAS[0];

const newGame = () =>
  createDuel({ arena, p1Name: 'A', p1Deck: DEFAULT_DECK, p2Name: 'B', p2Deck: DEFAULT_DECK });

const firstAffordable = (state, side) =>
  state[side].hand.find((c) => c.cost <= state[side].energy);

describe('duel setup', () => {
  test('both players start symmetrically with a full hand', () => {
    const g = newGame();
    expect(g.p1.hand).toHaveLength(5);
    expect(g.p2.hand).toHaveLength(5);
    expect(g.p1.metrics).toEqual(g.p2.metrics);
    expect(g.turn).toBe(1);
    expect(g.winner).toBeNull();
  });
});

describe('playing cards', () => {
  test('spends energy and removes the card from hand', () => {
    const g = newGame();
    const card = firstAffordable(g, 'p1');
    const next = playCard(g, 'p1', card.instanceId);

    expect(next.p1.energy).toBe(g.p1.energy - card.cost);
    expect(next.p1.hand).toHaveLength(4);
    expect(next.p1.playedThisTurn).toBe(true);
  });

  test('only one card may be played per turn', () => {
    const g = newGame();
    const [a, b] = g.p1.hand;
    const afterFirst = playCard(g, 'p1', a.instanceId);
    const afterSecond = playCard(afterFirst, 'p1', b.instanceId);

    expect(afterSecond.p1.hand).toHaveLength(4);
    expect(afterSecond.log[0]).toMatch(/one per turn/i);
  });

  test('sabotage damages the opponent, not the caster', () => {
    const g = newGame();
    const attack = { ...g.p1.hand[0], type: 'SABOTAGE', slot: 'target', cost: 1, icon: '💥', stats: { targetStability: -45 } };
    g.p1.hand[0] = attack;

    const next = playCard(g, 'p1', attack.instanceId);
    expect(next.p2.metrics.stability).toBe(55);
    expect(next.p1.metrics.stability).toBe(100);
  });

  test('the engine never mutates the state it is given', () => {
    const g = newGame();
    const snapshot = structuredClone(g);
    playCard(g, 'p1', g.p1.hand[0].instanceId);
    expect(g).toEqual(snapshot);
  });
});

describe('turns', () => {
  test('the turn only advances once both players have ended', () => {
    const g = newGame();
    const afterP1 = endTurn(g, 'p1');
    expect(afterP1.turn).toBe(1);
    expect(afterP1.p1.endedTurn).toBe(true);

    const afterBoth = endTurn(afterP1, 'p2');
    expect(afterBoth.turn).toBe(2);
    expect(afterBoth.p1.endedTurn).toBe(false);
    expect(afterBoth.p2.endedTurn).toBe(false);
  });

  test('a new turn refills energy and lets players act again', () => {
    let g = newGame();
    g = playCard(g, 'p1', firstAffordable(g, 'p1').instanceId);
    g = endTurn(endTurn(g, 'p1'), 'p2');

    expect(g.p1.playedThisTurn).toBe(false);
    expect(g.p1.energy).toBeGreaterThan(0);
    expect(g.p1.hand).toHaveLength(5);
  });
});

describe('winning', () => {
  test('reaching the target metric wins', () => {
    const g = newGame();
    g.p1.metrics.score = arena.targetScore;
    expect(endTurn(g, 'p1').winner).toBe('p1');
  });

  test('a crashed training run loses', () => {
    const g = newGame();
    g.p2.metrics.stability = 0;
    expect(endTurn(g, 'p1').winner).toBe('p1');
  });

  test('running out of turns awards the win to the higher score', () => {
    let g = newGame();
    g.turn = arena.maxTurns;
    g.p2.metrics.score = 50;
    g = endTurn(endTurn(g, 'p1'), 'p2');
    expect(g.winner).toBe('p2');
    expect(g.endReason).toMatch(/compute budget/i);
  });
});

describe('hidden information', () => {
  test('a guest never receives the host hand', () => {
    const g = newGame();
    const view = maskFor(g, 'p2');
    expect(view.p1.hand).toHaveLength(0);
    expect(view.p1.handCount).toBe(5);
    expect(view.p2.hand).toHaveLength(5);
  });
});
