import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

import { ALL_CARDS, DEFAULT_DECK } from './game/cards';
import { ARENAS } from './game/arenas';
import { botMove, createDuel, endTurn, maskFor, other, playCard, validDeck } from './game/engine';
import { hostRoom, joinRoom } from './net/peer';

import Intro from './screens/Intro';
import Hub from './screens/Hub';
import DeckBuilder from './screens/DeckBuilder';
import ArenaSelect from './screens/ArenaSelect';
import Lobby from './screens/Lobby';
import Duel from './screens/Duel';
import Result from './screens/Result';

const BOT_DECK = ALL_CARDS.filter((c) => c.unlockedDefault || c.type === 'SABOTAGE').map((c) => c.id);

export default function App() {
  const [screen, setScreen] = useState('INTRO');

  // Player profile (kept in memory for the session)
  const [username, setUsername] = useState('');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState(DEFAULT_DECK);
  const [deck, setDeck] = useState(DEFAULT_DECK);

  // Match
  const [mode, setMode] = useState('SOLO'); // SOLO | ONLINE
  const [mySide, setMySide] = useState('p1');
  const [duel, setDuel] = useState(null);
  const [botThinking, setBotThinking] = useState(false);
  const [rewardCard, setRewardCard] = useState(null);
  const [arenaPurpose, setArenaPurpose] = useState('SOLO');
  const [arena, setArena] = useState(null);

  // Online
  const [net, setNet] = useState({ role: null, status: 'idle', code: '', error: '', opponent: null });
  const netRef = useRef(null);
  const [guestInfo, setGuestInfo] = useState(null);

  // Refs mirror state that network callbacks read long after they were created.
  const duelRef = useRef(null);
  const arenaRef = useRef(null);
  const rewardedRef = useRef(false);
  const profileRef = useRef({ username, deck });
  useEffect(() => {
    profileRef.current = { username, deck };
    arenaRef.current = arena;
  });

  const commitDuel = useCallback((next) => {
    duelRef.current = next;
    setDuel(next);
    return next;
  }, []);

  const broadcast = useCallback((state) => {
    netRef.current?.send({ t: 'STATE', state: maskFor(state, 'p2') });
    return state;
  }, []);

  const closeNet = useCallback(() => {
    netRef.current?.close();
    netRef.current = null;
    setNet({ role: null, status: 'idle', code: '', error: '', opponent: null });
    setGuestInfo(null);
  }, []);

  useEffect(() => () => netRef.current?.close(), []);

  // ---------------------------------------------------------------- online

  const handleHostEvent = useCallback(
    (ev) => {
      if (ev.type === 'ROOM_OPEN') {
        setNet((n) => ({ ...n, status: 'waiting', code: ev.code }));
      } else if (ev.type === 'ERROR') {
        setNet((n) => ({ ...n, status: 'error', error: ev.message }));
      } else if (ev.type === 'DISCONNECTED') {
        setNet((n) => ({ ...n, status: 'gone' }));
      } else if (ev.type === 'DATA') {
        const msg = ev.data;
        if (msg.t === 'HELLO') {
          setGuestInfo({ username: msg.username, deck: msg.deck });
          setNet((n) => ({ ...n, status: 'ready', opponent: msg.username }));
          netRef.current?.send({ t: 'WELCOME', hostName: profileRef.current.username, arena: arenaRef.current });
        } else if (msg.t === 'PLAY' && duelRef.current) {
          commitDuel(broadcast(playCard(duelRef.current, 'p2', msg.instanceId)));
        } else if (msg.t === 'END_TURN' && duelRef.current) {
          commitDuel(broadcast(endTurn(duelRef.current, 'p2')));
        }
      }
    },
    [broadcast, commitDuel]
  );

  const handleGuestEvent = useCallback(
    (ev) => {
      if (ev.type === 'CONNECTED') {
        setNet((n) => ({ ...n, status: 'joined' }));
        netRef.current?.send({
          t: 'HELLO',
          username: profileRef.current.username,
          deck: profileRef.current.deck
        });
      } else if (ev.type === 'ERROR') {
        setNet((n) => ({ ...n, status: 'error', error: ev.message }));
      } else if (ev.type === 'DISCONNECTED') {
        setNet((n) => ({ ...n, status: 'gone' }));
      } else if (ev.type === 'DATA') {
        const msg = ev.data;
        if (msg.t === 'WELCOME') {
          setArena(msg.arena);
          setNet((n) => ({ ...n, status: 'ready', opponent: msg.hostName }));
        } else if (msg.t === 'START') {
          rewardedRef.current = false;
          setArena(msg.state.arena);
          commitDuel(msg.state);
          setScreen('DUEL');
        } else if (msg.t === 'STATE') {
          commitDuel(msg.state);
        }
      }
    },
    [commitDuel]
  );

  const startHosting = (chosenArena) => {
    setMode('ONLINE');
    setMySide('p1');
    setArena(chosenArena);
    arenaRef.current = chosenArena;
    setGuestInfo(null);
    setNet({ role: 'host', status: 'opening', code: '', error: '', opponent: null });
    setScreen('LOBBY');
    netRef.current = hostRoom(handleHostEvent);
  };

  const startJoining = (code) => {
    setMode('ONLINE');
    setMySide('p2');
    setNet({ role: 'guest', status: 'connecting', code: code.toUpperCase(), error: '', opponent: null });
    setScreen('LOBBY');
    netRef.current = joinRoom(code, handleGuestEvent);
  };

  const hostStartDuel = () => {
    if (!guestInfo || !arena) return;
    rewardedRef.current = false;
    const state = createDuel({
      arena,
      p1Name: username || 'Host',
      p1Deck: validDeck(deck),
      p2Name: guestInfo.username || 'Challenger',
      p2Deck: validDeck(guestInfo.deck)
    });
    commitDuel(state);
    netRef.current?.send({ t: 'START', state: maskFor(state, 'p2') });
    setScreen('DUEL');
  };

  // ------------------------------------------------------------------ solo

  const startSolo = (chosenArena) => {
    rewardedRef.current = false;
    setMode('SOLO');
    setMySide('p1');
    setArena(chosenArena);
    commitDuel(
      createDuel({
        arena: chosenArena,
        p1Name: username || 'You',
        p1Deck: validDeck(deck),
        p2Name: 'Rival Lab AI',
        p2Deck: BOT_DECK
      })
    );
    setScreen('DUEL');
  };

  const runBotTurn = () => {
    setBotThinking(true);
    setTimeout(() => {
      let state = duelRef.current;
      if (state && !state.winner) {
        const move = botMove(state);
        if (move) state = playCard(state, 'p2', move);
        commitDuel(endTurn(state, 'p2'));
      }
      setBotThinking(false);
    }, 950);
  };

  // --------------------------------------------------------------- actions

  const isGuest = mode === 'ONLINE' && mySide === 'p2';

  const handlePlay = (card) => {
    if (isGuest) {
      netRef.current?.send({ t: 'PLAY', instanceId: card.instanceId });
      return;
    }
    const next = playCard(duelRef.current, 'p1', card.instanceId);
    commitDuel(mode === 'ONLINE' ? broadcast(next) : next);
  };

  const handleEndTurn = () => {
    if (isGuest) {
      netRef.current?.send({ t: 'END_TURN' });
      return;
    }
    const next = endTurn(duelRef.current, 'p1');
    commitDuel(mode === 'ONLINE' ? broadcast(next) : next);
    if (mode === 'SOLO' && !next.winner) runBotTurn();
  };

  const leaveMatch = () => {
    if (mode === 'ONLINE') closeNet();
    commitDuel(null);
    setRewardCard(null);
    setScreen('HUB');
  };

  // Reward the winner, then show the result screen.
  useEffect(() => {
    if (!duel?.winner) return;
    if (duel.winner === mySide && !rewardedRef.current) {
      rewardedRef.current = true;
      setXp((x) => x + 250);
      setLevel((l) => l + 1);
      const locked = ALL_CARDS.find((c) => !unlockedIds.includes(c.id));
      if (locked) {
        setUnlockedIds((prev) => [...prev, locked.id]);
        setRewardCard(locked);
      }
    }
    const timer = setTimeout(() => setScreen('RESULT'), 1100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel?.winner]);

  const toggleDeckCard = (cardId) => {
    setDeck((prev) => {
      if (prev.includes(cardId)) return prev.length > 4 ? prev.filter((id) => id !== cardId) : prev;
      return prev.length < 8 ? [...prev, cardId] : prev;
    });
  };

  // ---------------------------------------------------------------- render

  return (
    <div className="app">
      {screen === 'INTRO' && (
        <Intro username={username} setUsername={setUsername} onDone={() => setScreen('HUB')} />
      )}

      {screen === 'HUB' && (
        <Hub
          username={username}
          level={level}
          xp={xp}
          unlockedCount={unlockedIds.length}
          totalCards={ALL_CARDS.length}
          deckSize={deck.length}
          onSolo={() => {
            setArenaPurpose('SOLO');
            setScreen('ARENA');
          }}
          onHost={() => {
            setArenaPurpose('HOST');
            setScreen('ARENA');
          }}
          onJoin={(code) => startJoining(code)}
          onDeck={() => setScreen('DECK')}
        />
      )}

      {screen === 'DECK' && (
        <DeckBuilder
          deck={deck}
          unlockedIds={unlockedIds}
          onToggle={toggleDeckCard}
          onBack={() => setScreen('HUB')}
        />
      )}

      {screen === 'ARENA' && (
        <ArenaSelect
          arenas={ARENAS}
          purpose={arenaPurpose}
          onPick={(a) => (arenaPurpose === 'HOST' ? startHosting(a) : startSolo(a))}
          onBack={() => setScreen('HUB')}
        />
      )}

      {screen === 'LOBBY' && (
        <Lobby
          net={net}
          arena={arena}
          role={net.role}
          username={username}
          onStart={hostStartDuel}
          onCancel={() => {
            closeNet();
            setScreen('HUB');
          }}
        />
      )}

      {screen === 'DUEL' && duel && (
        <Duel
          duel={duel}
          mySide={mySide}
          mode={mode}
          botThinking={botThinking}
          opponentGone={mode === 'ONLINE' && net.status === 'gone'}
          onPlay={handlePlay}
          onEndTurn={handleEndTurn}
          onLeave={leaveMatch}
        />
      )}

      {screen === 'RESULT' && duel && (
        <Result
          duel={duel}
          mySide={mySide}
          mode={mode}
          rewardCard={rewardCard}
          level={level}
          xp={xp}
          onContinue={leaveMatch}
        />
      )}
    </div>
  );
}

export { other };
