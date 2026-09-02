import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import { ALL_CARDS, CARD_TYPE_INFO } from '../game/cards';

const FILTERS = [
  { key: 'ALL', label: 'All cards' },
  { key: 'BACKBONE', label: '🧠 Backbones' },
  { key: 'ATTENTION', label: '⚡ Attention' },
  { key: 'OPTIMIZER', label: '📉 Optimizers' },
  { key: 'DEFENSE', label: '🛡️ Defence' },
  { key: 'SABOTAGE', label: '💥 Sabotage' }
];

export default function DeckBuilder({ deck, unlockedIds, onToggle, onBack }) {
  const [filter, setFilter] = useState('ALL');
  const [learn, setLearn] = useState(ALL_CARDS[0]);

  const visible = ALL_CARDS.filter((c) => filter === 'ALL' || c.type === filter);

  return (
    <div className="screen">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Your collection</h1>
          <p className="muted">
            Your deck holds {deck.length} of 8 cards. Tap any card to read what it really does.
          </p>
        </div>
        <button className="btn btn--ghost" onClick={onBack}>
          ← Back
        </button>
      </header>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`pill ${filter === f.key ? 'is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="deck-layout">
        <div className="card-grid">
          {visible.map((card) => {
            const unlocked = unlockedIds.includes(card.id);
            const equipped = deck.includes(card.id);
            return (
              <GameCard
                key={card.id}
                card={card}
                locked={!unlocked}
                selected={learn?.id === card.id}
                onSelect={setLearn}
                footer={
                  unlocked ? (
                    <button
                      className={`btn btn--tiny ${equipped ? 'btn--ghost' : 'btn--primary'}`}
                      onClick={() => onToggle(card.id)}
                      disabled={!equipped && deck.length >= 8}
                    >
                      {equipped ? 'In deck — remove' : deck.length >= 8 ? 'Deck full' : 'Add to deck'}
                    </button>
                  ) : (
                    <span className="locked-note">Win a duel to unlock</span>
                  )
                }
              />
            );
          })}
        </div>

        {learn && (
          <aside className="learn learn--sticky">
            <span className="learn__tag">{CARD_TYPE_INFO[learn.type].label}</span>
            <h2 className="learn__title">
              <span aria-hidden="true">{learn.icon}</span> {learn.name}
            </h2>
            <p className="learn__text">{learn.eduInfo}</p>
            <p className="learn__hint muted">{CARD_TYPE_INFO[learn.type].blurb}</p>
          </aside>
        )}
      </div>
    </div>
  );
}
