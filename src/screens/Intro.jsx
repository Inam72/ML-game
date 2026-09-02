import React, { useState } from 'react';

const STEPS = [
  {
    title: 'You are building an AI model',
    icon: '🧠',
    body: (
      <>
        <p>
          Every card is a real piece of machine learning — the kind of thing researchers present at
          conferences like NeurIPS. You will stack them into a working model and race a rival lab.
        </p>
        <p className="muted">No maths background needed. Every card explains itself as you play.</p>
      </>
    )
  },
  {
    title: 'Fill four slots, one card per turn',
    icon: '🧩',
    body: (
      <>
        <ul className="bullets">
          <li>
            <b>🧠 Backbone</b> — the main network that does the thinking
          </li>
          <li>
            <b>⚡ Attention</b> — how it connects information together
          </li>
          <li>
            <b>📉 Optimizer</b> — how it learns from its mistakes
          </li>
          <li>
            <b>🛡️ Defence</b> — what stops training from falling apart
          </li>
        </ul>
        <p className="muted">
          You only get one card per turn and limited compute, so choose carefully — just like a real
          lab with a limited GPU budget.
        </p>
      </>
    )
  },
  {
    title: 'Reach the target before your rival',
    icon: '🏁',
    body: (
      <>
        <p>
          Each arena is a real problem — hunting planets, spotting tumours, forecasting storms — with
          a score you must reach before the compute budget runs out.
        </p>
        <p>
          You can also play <b>sabotage</b> cards. These are genuine failures that wreck real
          training runs: exploding gradients, out-of-memory crashes, data drift.
        </p>
      </>
    )
  }
];

export default function Intro({ username, setUsername, onDone }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="screen screen--center">
      <div className="panel panel--intro">
        <div className="brand">
          <span className="brand__badge">Learn AI by playing</span>
          <h1 className="brand__title">
            AI Architect <span className="brand__accent">Duel</span>
          </h1>
          <p className="brand__sub">Build a machine learning model card by card, then out-train a rival.</p>
        </div>

        <div className="intro-step">
          <div className="intro-step__icon" aria-hidden="true">
            {current.icon}
          </div>
          <div>
            <h2 className="intro-step__title">{current.title}</h2>
            <div className="intro-step__body">{current.body}</div>
          </div>
        </div>

        {isLast && (
          <label className="field">
            <span className="field__label">Pick a name for your lab</span>
            <input
              className="field__input"
              type="text"
              maxLength={18}
              placeholder="e.g. Ada, Team Neuron, Lab 42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onDone()}
            />
          </label>
        )}

        <div className="dots" role="tablist" aria-label="Tutorial progress">
          {STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className={`dot ${i === step ? 'is-active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}: ${s.title}`}
              aria-selected={i === step}
              role="tab"
            />
          ))}
        </div>

        <div className="row row--between">
          <button className="btn btn--ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            Back
          </button>
          {isLast ? (
            <button className="btn btn--primary" onClick={onDone}>
              Start playing →
            </button>
          ) : (
            <button className="btn btn--primary" onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
