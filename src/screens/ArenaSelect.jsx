import React from 'react';
import { CARD_TYPE_INFO } from '../game/cards';

export default function ArenaSelect({ arenas, purpose, onPick, onBack }) {
  return (
    <div className="screen">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">
            {purpose === 'HOST' ? 'Pick the arena for your friend' : 'Where will you train?'}
          </h1>
          <p className="muted">
            Every arena is a real place machine learning is used. Cards matching the arena bonus get a
            35% boost.
          </p>
        </div>
        <button className="btn btn--ghost" onClick={onBack}>
          ← Back
        </button>
      </header>

      <div className="arena-grid">
        {arenas.map((arena) => (
          <button key={arena.id} className={`arena arena--${arena.theme}`} onClick={() => onPick(arena)}>
            <span className="arena__icon" aria-hidden="true">
              {arena.icon}
            </span>
            <span className={`arena__difficulty diff--${arena.difficulty.toLowerCase()}`}>
              {arena.difficulty}
            </span>
            <h2 className="arena__title">{arena.name}</h2>
            <p className="arena__desc">{arena.desc}</p>
            <p className="arena__why">{arena.why}</p>
            <span className="arena__meta">
              <span className="chip chip--gold">
                Target {arena.targetScore}% {arena.metricName}
              </span>
              <span className="chip chip--info">{arena.maxTurns} turns</span>
              <span className="chip chip--good">Bonus: {CARD_TYPE_INFO[arena.bonusType].label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
