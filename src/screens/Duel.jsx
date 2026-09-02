import React, { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import { CARD_TYPE_INFO, SLOT_INFO, SLOT_ORDER } from '../game/cards';
import { other } from '../game/engine';

function Meter({ label, value, max, tone, suffix = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meter">
      <div className="meter__head">
        <span>{label}</span>
        <span className="meter__value">
          {value}
          {suffix}
        </span>
      </div>
      <div className="meter__track">
        <div className={`meter__fill meter__fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PlayerPanel({ side, arena, isYou, waiting }) {
  return (
    <div className={`pstatus ${isYou ? 'pstatus--you' : 'pstatus--foe'}`}>
      <div className="pstatus__head">
        <span className="pstatus__avatar">{isYou ? '🧑‍🔬' : '🧑‍💻'}</span>
        <div>
          <b className="pstatus__name">{side.username}</b>
          <span className="muted small">{isYou ? 'You' : 'Opponent'}</span>
        </div>
        {waiting && <span className="badge badge--wait">thinking…</span>}
      </div>
      <Meter
        label={arena.metricName}
        value={side.metrics.score}
        max={arena.targetScore}
        tone={isYou ? 'good' : 'foe'}
        suffix="%"
      />
      <Meter label="Training health" value={side.metrics.stability} max={100} tone="stability" suffix="%" />
      <div className="pstatus__minor">
        <span title="Lower is better">Loss {side.metrics.loss}</span>
        <span title="Lower is faster">{side.metrics.latency}ms</span>
      </div>
    </div>
  );
}

function Pipeline({ side, isYou }) {
  return (
    <div className={`pipeline ${isYou ? 'pipeline--you' : ''}`}>
      <h3 className="pipeline__title">{isYou ? 'Your model' : `${side.username}'s model`}</h3>
      <div className="pipeline__slots">
        {SLOT_ORDER.map((slot) => {
          const card = side.arch[slot];
          const info = SLOT_INFO[slot];
          return (
            <div key={slot} className={`slot ${card ? 'is-filled' : ''}`}>
              <span className="slot__label">
                {info.icon} {info.label}
              </span>
              {card ? (
                <>
                  <span className="slot__card">{card.shortName}</span>
                  <span className="slot__hint muted">{CARD_TYPE_INFO[card.type].label}</span>
                </>
              ) : (
                <span className="slot__empty">empty — {info.hint}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Duel({ duel, mySide, mode, botThinking, opponentGone, onPlay, onEndTurn, onLeave }) {
  const me = duel[mySide];
  const foe = duel[other(mySide)];
  const { arena } = duel;
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    setPicked((p) => (p && me.hand.some((c) => c.instanceId === p.instanceId) ? p : null));
  }, [me.hand]);

  const foeHandCount = foe.handCount ?? foe.hand.length;
  const yourTurnOver = me.endedTurn;
  const canAct = !duel.winner && !yourTurnOver && !opponentGone;
  const canPlayPicked = canAct && picked && !me.playedThisTurn && me.energy >= picked.cost;

  const waitingOnFoe = yourTurnOver && !duel.winner;
  const waitLabel = mode === 'SOLO' ? 'Rival lab is training…' : `Waiting for ${foe.username}…`;

  return (
    <div className="screen screen--duel">
      <header className="duel-top">
        <button className="btn btn--ghost btn--tiny" onClick={onLeave}>
          ← Leave
        </button>
        <div className="duel-top__arena">
          <span aria-hidden="true">{arena.icon}</span>
          <div>
            <b>{arena.name}</b>
            <p className="muted small">
              Reach {arena.targetScore}% {arena.metricName} · bonus for{' '}
              {CARD_TYPE_INFO[arena.bonusType].label} cards
            </p>
          </div>
        </div>
        <div className="turn-pill">
          <span className="turn-pill__num">
            Turn {Math.min(duel.turn, arena.maxTurns)}/{arena.maxTurns}
          </span>
          <span className="turn-pill__mode">{mode === 'SOLO' ? 'Practice' : 'Online duel'}</span>
        </div>
      </header>

      <section className="status-row">
        <PlayerPanel side={me} arena={arena} isYou />
        <div className="status-row__vs">VS</div>
        <PlayerPanel side={foe} arena={arena} isYou={false} waiting={botThinking || (waitingOnFoe && mode !== 'SOLO')} />
      </section>

      <section className="board">
        <Pipeline side={me} isYou />

        <div className="feed">
          <h3 className="feed__title">What just happened</h3>
          <ul className="feed__list">
            {duel.log.map((line, i) => (
              <li key={`${i}-${line}`} className={i === 0 ? 'is-latest' : ''}>
                {line}
              </li>
            ))}
          </ul>
          <div className="feed__foot">
            <span className="muted small">
              {foe.username} holds {foeHandCount} card{foeHandCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <Pipeline side={foe} isYou={false} />
      </section>

      <section className="handbar">
        <div className="handbar__head">
          <div className="energy">
            <span className="energy__icon" aria-hidden="true">
              ⚡
            </span>
            <span className="energy__value">{me.energy}</span>
            <span className="muted small">compute left</span>
          </div>
          <div className="handbar__rule">
            {duel.winner ? (
              <span className="badge badge--done">Duel over</span>
            ) : me.playedThisTurn ? (
              <span className="badge badge--used">Card played — end your turn</span>
            ) : (
              <span className="badge badge--ready">1 card left to play this turn</span>
            )}
          </div>
          <button className="btn btn--primary" onClick={onEndTurn} disabled={!canAct}>
            {waitingOnFoe ? waitLabel : 'End turn ⏱️'}
          </button>
        </div>

        <div className="hand">
          {me.hand.map((card) => (
            <GameCard
              key={card.instanceId}
              card={card}
              size="sm"
              selected={picked?.instanceId === card.instanceId}
              disabled={!canAct || me.playedThisTurn || me.energy < card.cost}
              onSelect={setPicked}
            />
          ))}
          {!me.hand.length && <p className="muted">No cards left in hand.</p>}
        </div>
      </section>

      <section className={`learn learn--bar ${picked ? '' : 'learn--empty'}`}>
        {picked ? (
          <>
            <div className="learn__main">
              <span className="learn__tag">{CARD_TYPE_INFO[picked.type].label}</span>
              <h3 className="learn__title">
                <span aria-hidden="true">{picked.icon}</span> {picked.name}
              </h3>
              <p className="learn__text">{picked.eduInfo}</p>
            </div>
            <button className="btn btn--play" onClick={() => onPlay(picked)} disabled={!canPlayPicked}>
              {picked.type === 'SABOTAGE' ? 'Launch attack' : 'Install card'} · ⚡{picked.cost}
            </button>
          </>
        ) : (
          <p className="muted">Tap a card in your hand to see what it does before you play it.</p>
        )}
      </section>

      {opponentGone && (
        <div className="overlay">
          <div className="panel panel--small">
            <h2>Opponent disconnected</h2>
            <p className="muted">They closed the tab or lost connection, so this duel cannot continue.</p>
            <button className="btn btn--primary" onClick={onLeave}>
              Back to menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
