import React, { useState } from 'react';

export default function Lobby({ net, arena, role, username, onStart, onCancel }) {
  const [copied, setCopied] = useState(false);
  const isHost = role === 'host';
  const ready = net.status === 'ready';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(net.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const statusLine = () => {
    if (net.status === 'error') return net.error;
    if (net.status === 'gone') return 'Your opponent left the room.';
    if (net.status === 'reconnecting') return 'Reconnecting to the matchmaking service…';
    if (isHost) {
      if (net.status === 'opening') return 'Opening your room…';
      if (net.status === 'waiting') return 'Room is live. Waiting for a challenger to join…';
      return `${net.opponent} is here and ready!`;
    }
    if (net.status === 'connecting') {
      return net.attempt > 1 ? `Still looking… (try ${net.attempt} of ${net.of})` : 'Finding the room…';
    }
    if (net.status === 'joined') return 'Connected — saying hello…';
    return `Joined ${net.opponent}'s duel. Waiting for them to start…`;
  };

  const failed = net.status === 'error' || net.status === 'gone';

  return (
    <div className="screen screen--center">
      <div className="panel panel--lobby">
        <h1 className="lobby__title">{isHost ? 'Your duel room' : 'Joining a duel'}</h1>

        {isHost && (
          <div className="code-box">
            <span className="code-box__label">Share this code</span>
            <span className="code-box__code">{net.code || '·····'}</span>
            <button className="btn btn--ghost btn--tiny" onClick={copyCode} disabled={!net.code}>
              {copied ? '✓ Copied' : 'Copy code'}
            </button>
          </div>
        )}

        {!isHost && (
          <div className="code-box">
            <span className="code-box__label">Room code</span>
            <span className="code-box__code">{net.code}</span>
          </div>
        )}

        <div className={`status ${failed ? 'status--bad' : ''} ${ready ? 'status--good' : ''}`}>
          {!failed && !ready && <span className="spinner" aria-hidden="true" />}
          <span>{statusLine()}</span>
        </div>

        <div className="lobby__players">
          <div className="lobby__player">
            <span className="lobby__avatar">🧑‍🔬</span>
            <span className="lobby__pname">{username || 'You'}</span>
            <span className="muted">{isHost ? 'Host' : 'Challenger'}</span>
          </div>
          <span className="lobby__vs">VS</span>
          <div className={`lobby__player ${net.opponent ? '' : 'is-empty'}`}>
            <span className="lobby__avatar">{net.opponent ? '🧑‍💻' : '⏳'}</span>
            <span className="lobby__pname">{net.opponent || 'Waiting…'}</span>
            <span className="muted">{isHost ? 'Challenger' : 'Host'}</span>
          </div>
        </div>

        {arena && (
          <div className="lobby__arena">
            <span aria-hidden="true">{arena.icon}</span>
            <div>
              <b>{arena.name}</b>
              <p className="muted">
                Reach {arena.targetScore}% {arena.metricName} in {arena.maxTurns} turns
              </p>
            </div>
          </div>
        )}

        <p className="muted small">
          {isHost
            ? 'Keep this tab open and in front while you wait — the room only stays findable while this page is awake. If your friend cannot find the code, come back to this tab and have them try again.'
            : 'Both players connect directly, browser to browser. If it will not connect, one of you may be on a network that blocks peer-to-peer traffic — a phone hotspot usually fixes it.'}
        </p>

        <div className="row row--between">
          <button className="btn btn--ghost" onClick={onCancel}>
            Leave room
          </button>
          {isHost && (
            <button className="btn btn--primary" onClick={onStart} disabled={!ready}>
              Start the duel →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
