import React, { useState } from 'react';

export default function Hub({
  username,
  level,
  xp,
  unlockedCount,
  totalCards,
  deckSize,
  onSolo,
  onHost,
  onJoin,
  onDeck
}) {
  const [code, setCode] = useState('');
  const canJoin = code.trim().length >= 4;

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="topbar__hello">Welcome back</p>
          <h1 className="topbar__name">{username || 'Architect'}</h1>
        </div>
        <div className="topbar__stats">
          <div className="stat">
            <span className="stat__value">{level}</span>
            <span className="stat__label">Level</span>
          </div>
          <div className="stat">
            <span className="stat__value">{xp}</span>
            <span className="stat__label">XP</span>
          </div>
          <div className="stat">
            <span className="stat__value">
              {unlockedCount}/{totalCards}
            </span>
            <span className="stat__label">Cards</span>
          </div>
        </div>
      </header>

      <div className="hub-grid">
        <button className="tile tile--solo" onClick={onSolo}>
          <span className="tile__icon" aria-hidden="true">
            🤖
          </span>
          <h2 className="tile__title">Practice duel</h2>
          <p className="tile__body">
            Play against the rival lab AI. Best place to learn what each card does.
          </p>
          <span className="tile__cta">Choose an arena →</span>
        </button>

        <button className="tile tile--online" onClick={onHost}>
          <span className="tile__icon" aria-hidden="true">
            🌍
          </span>
          <h2 className="tile__title">Play a friend</h2>
          <p className="tile__body">
            Host an online duel and share the room code. Works on any two devices, anywhere.
          </p>
          <span className="tile__cta">Host a room →</span>
        </button>

        <button className="tile tile--deck" onClick={onDeck}>
          <span className="tile__icon" aria-hidden="true">
            🃏
          </span>
          <h2 className="tile__title">Your deck</h2>
          <p className="tile__body">
            {deckSize} cards ready. Read what each one really does, and swap in ones you unlock.
          </p>
          <span className="tile__cta">Open collection →</span>
        </button>
      </div>

      <div className="join-bar">
        <div>
          <h3 className="join-bar__title">Got a room code from a friend?</h3>
          <p className="join-bar__sub muted">Type their 5-letter code to jump into their duel.</p>
        </div>
        <form
          className="join-bar__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (canJoin) onJoin(code.trim().toUpperCase());
          }}
        >
          <input
            className="field__input field__input--code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
            placeholder="ABCDE"
            maxLength={5}
            aria-label="Room code"
          />
          <button className="btn btn--primary" type="submit" disabled={!canJoin}>
            Join duel
          </button>
        </form>
      </div>
    </div>
  );
}
