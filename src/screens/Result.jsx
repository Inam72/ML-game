import React from 'react';
import GameCard from '../components/GameCard';
import { other } from '../game/engine';

export default function Result({ duel, mySide, mode, rewardCard, level, xp, onContinue }) {
  const me = duel[mySide];
  const foe = duel[other(mySide)];
  const won = duel.winner === mySide;
  const draw = duel.winner === 'draw';

  const headline = draw ? 'Dead heat!' : won ? 'You win!' : 'Your rival wins';
  const emoji = draw ? '🤝' : won ? '🏆' : '📉';

  return (
    <div className="screen screen--center">
      <div className={`panel panel--result ${won ? 'is-win' : draw ? '' : 'is-loss'}`}>
        <div className="result__emoji" aria-hidden="true">
          {emoji}
        </div>
        <h1 className="result__title">{headline}</h1>
        <p className="muted">{duel.endReason}</p>

        <div className="result__scores">
          <div className="result__score">
            <span className="result__num">{me.metrics.score}%</span>
            <span className="muted">{me.username}</span>
          </div>
          <span className="result__dash">—</span>
          <div className="result__score">
            <span className="result__num">{foe.metrics.score}%</span>
            <span className="muted">{foe.username}</span>
          </div>
        </div>

        <p className="result__target muted small">
          Target was {duel.arena.targetScore}% {duel.arena.metricName} at {duel.arena.name}
        </p>

        {won && (
          <div className="result__rewards">
            <span className="chip chip--gold">+250 XP (total {xp})</span>
            <span className="chip chip--info">Level {level}</span>
          </div>
        )}

        {won && rewardCard && (
          <div className="result__unlock">
            <h2 className="result__unlock-title">New card unlocked</h2>
            <GameCard card={rewardCard} size="sm" />
            <p className="learn__text">{rewardCard.eduInfo}</p>
          </div>
        )}

        {!won && !draw && (
          <p className="result__tip">
            Tip: match your cards to the arena bonus for a 35% boost, and keep a defence card installed
            so a sabotage cannot crash your training run.
          </p>
        )}

        <button className="btn btn--primary" onClick={onContinue}>
          {mode === 'SOLO' ? 'Back to menu' : 'Leave duel'}
        </button>
      </div>
    </div>
  );
}
