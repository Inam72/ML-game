import React from 'react';
import { CARD_TYPE_INFO } from '../game/cards';

// Turns raw stat numbers into labels a first-time player can read.
export function statChips(card) {
  const s = card.stats || {};
  const chips = [];
  const push = (value, label, goodWhenNegative = false) => {
    if (!value) return;
    const good = goodWhenNegative ? value < 0 : value > 0;
    const sign = value > 0 ? '+' : '−';
    chips.push({ key: label, text: `${sign}${Math.abs(value)} ${label}`, good });
  };

  push(s.accBoost, 'score');
  push(s.lossReduce && -s.lossReduce, 'loss', true);
  push(s.stabilityBoost, 'stability');
  push(s.latencyMs, 'ms', true);
  push(s.targetAcc, 'their score');
  push(s.targetStability, 'their stability');
  push(s.targetLossSpike, 'their loss');
  push(s.targetLatencyMs, 'their ms');
  return chips;
}

export default function GameCard({ card, selected, disabled, locked, onSelect, footer, size = 'md' }) {
  const info = CARD_TYPE_INFO[card.type];
  const classes = [
    'gcard',
    `gcard--${info.color}`,
    `gcard--${size}`,
    selected ? 'is-selected' : '',
    disabled ? 'is-disabled' : '',
    locked ? 'is-locked' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <button
        type="button"
        className="gcard__body"
        onClick={() => onSelect?.(card)}
        aria-pressed={!!selected}
      >
        <span className="gcard__top">
          <span className="gcard__icon" aria-hidden="true">
            {locked ? '🔒' : card.icon}
          </span>
          <span className="gcard__cost" title={`Costs ${card.cost} compute`}>
            ⚡{card.cost}
          </span>
        </span>
        <span className="gcard__name">{card.name}</span>
        <span className="gcard__type">{info.label}</span>
        <span className="gcard__desc">{card.desc}</span>
        <span className="gcard__stats">
          {statChips(card).map((chip) => (
            <span key={chip.key} className={`chip ${chip.good ? 'chip--good' : 'chip--bad'}`}>
              {chip.text}
            </span>
          ))}
        </span>
      </button>
      {footer && <div className="gcard__footer">{footer}</div>}
    </div>
  );
}
