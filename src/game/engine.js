import { ALL_CARDS, getCard } from './cards';

// The engine is deliberately pure: every function takes a state and returns a
// new one. Solo play runs it locally; online play runs it on the host's device
// and ships the result to the guest.

const HAND_SIZE = 5;
const MAX_LOG = 9;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round2 = (v) => Number(v.toFixed(2));

export const other = (side) => (side === 'p1' ? 'p2' : 'p1');

function drawOne(deckIds) {
  const pool = deckIds.map(getCard).filter(Boolean);
  const card = pool[Math.floor(Math.random() * pool.length)];
  return { ...card, instanceId: `${card.id}-${Math.random().toString(36).slice(2, 9)}` };
}

function newSide(username, deckIds) {
  return {
    username: username || 'Player',
    deckIds,
    metrics: { score: 18, loss: 2.5, latency: 100, stability: 100 },
    arch: { model: null, attention: null, optimizer: null, defense: null },
    hand: Array.from({ length: HAND_SIZE }, () => drawOne(deckIds)),
    energy: 3,
    playedThisTurn: false,
    endedTurn: false
  };
}

function log(state, msg) {
  state.log = [msg, ...state.log].slice(0, MAX_LOG);
}

export function createDuel({ arena, p1Name, p1Deck, p2Name, p2Deck }) {
  const state = {
    arena,
    turn: 1,
    winner: null, // null | 'p1' | 'p2' | 'draw'
    endReason: null,
    log: [],
    p1: newSide(p1Name, p1Deck),
    p2: newSide(p2Name, p2Deck)
  };
  log(state, `Goal: reach ${arena.targetScore}% ${arena.metricName} within ${arena.maxTurns} turns.`);
  log(state, `${arena.icon} Duel begins at ${arena.name}!`);
  return state;
}

export function playCard(state, side, instanceId) {
  const next = structuredClone(state);
  const me = next[side];
  const foe = next[other(side)];
  const card = me.hand.find((c) => c.instanceId === instanceId);

  if (!card || next.winner) return state;
  if (me.playedThisTurn) {
    log(next, `⚠️ ${me.username} already played a card — one per turn!`);
    return next;
  }
  if (me.energy < card.cost) {
    log(next, `⚠️ Not enough compute for ${card.name} (needs ${card.cost}).`);
    return next;
  }

  me.energy -= card.cost;
  me.playedThisTurn = true;
  me.hand = me.hand.filter((c) => c.instanceId !== instanceId);

  if (card.type === 'SABOTAGE') {
    foe.metrics.stability = clamp(foe.metrics.stability + (card.stats.targetStability || 0), 0, 100);
    foe.metrics.loss = round2(foe.metrics.loss + (card.stats.targetLossSpike || 0));
    foe.metrics.latency = Math.max(5, foe.metrics.latency + (card.stats.targetLatencyMs || 0));
    foe.metrics.score = Math.max(0, round2(foe.metrics.score + (card.stats.targetAcc || 0)));
    log(next, `${card.icon} ${me.username} hit ${foe.username} with ${card.name}!`);
  } else {
    const replaced = me.arch[card.slot];
    me.arch[card.slot] = card;
    const bonus = card.type === next.arena.bonusType ? 1.35 : 1;
    me.metrics.score = round2(Math.min(99.9, me.metrics.score + (card.stats.accBoost || 0) * bonus));
    me.metrics.loss = Math.max(0.01, round2(me.metrics.loss - (card.stats.lossReduce || 0)));
    me.metrics.latency = Math.max(5, me.metrics.latency + (card.stats.latencyMs || 0));
    me.metrics.stability = clamp(me.metrics.stability + (card.stats.stabilityBoost || 0), 0, 100);
    log(
      next,
      `${card.icon} ${me.username} installed ${card.name}${replaced ? ` (replacing ${replaced.shortName})` : ''}` +
        (bonus > 1 ? ' — arena bonus!' : '')
    );
  }

  return judge(next);
}

export function endTurn(state, side) {
  if (state.winner) return state;
  const next = structuredClone(state);
  next[side].endedTurn = true;

  if (next.p1.endedTurn && next.p2.endedTurn) {
    next.turn += 1;
    for (const s of ['p1', 'p2']) {
      next[s].playedThisTurn = false;
      next[s].endedTurn = false;
      next[s].energy = Math.min(6, 3 + Math.floor(next.turn / 2));
      if (next[s].hand.length < HAND_SIZE) next[s].hand.push(drawOne(next[s].deckIds));
    }
    log(next, `⏱️ Turn ${next.turn} — both models train another epoch.`);
  } else {
    log(next, `${next[side].username} finished their turn.`);
  }

  return judge(next);
}

function judge(state) {
  const { p1, p2, arena } = state;
  const decide = (winner, endReason) => ({ ...state, winner, endReason });

  if (p2.metrics.stability <= 0) return decide('p1', `${p2.username}'s training run crashed.`);
  if (p1.metrics.stability <= 0) return decide('p2', `${p1.username}'s training run crashed.`);
  if (p1.metrics.score >= arena.targetScore) return decide('p1', `${p1.username} hit the target metric.`);
  if (p2.metrics.score >= arena.targetScore) return decide('p2', `${p2.username} hit the target metric.`);

  if (state.turn > arena.maxTurns) {
    if (p1.metrics.score === p2.metrics.score) return decide('draw', 'Compute budget spent — dead heat.');
    const winner = p1.metrics.score > p2.metrics.score ? 'p1' : 'p2';
    return decide(winner, 'Compute budget spent — highest score wins.');
  }
  return state;
}

// Scores every card the bot can afford and plays the best one. It weighs the
// same things a person does: finish if you can, stop the rival if they are
// about to finish, fill an empty slot, shore up a shaky run, and respect the
// arena bonus.
const WINNING_MOVE = 500;

export function scoreMove(state, side, card) {
  const me = state[side];
  const foe = state[other(side)];
  const { arena } = state;

  const foeThreat = foe.metrics.score / arena.targetScore;
  const fragile = me.metrics.stability < 55;
  let value = -card.cost * 1.5; // cheap plays leave compute for later turns

  if (card.type === 'SABOTAGE') {
    const stabilityHit = Math.abs(card.stats.targetStability || 0);
    const scoreHit = Math.abs(card.stats.targetAcc || 0);
    value += stabilityHit * 0.55 + scoreHit * 1.2 + (card.stats.targetLossSpike || 0) * 8;
    // Hitting the rival matters far more once they are near the target.
    value *= 0.75 + foeThreat * 1.6;
    if (foe.metrics.stability + (card.stats.targetStability || 0) <= 0) value += WINNING_MOVE;
    return value;
  }

  const mult = (c) => (c.type === arena.bonusType ? 1.35 : 1);
  const gain = (card.stats.accBoost || 0) * mult(card);
  const held = me.arch[card.slot];
  // Swapping a slot only earns the difference, so an upgrade must be real.
  const net = held ? gain - (held.stats.accBoost || 0) * mult(held) : gain;

  value += net * 1.4;
  value += (card.stats.lossReduce || 0) * 10;
  value += (card.stats.stabilityBoost || 0) * (fragile ? 0.9 : 0.25);
  value -= Math.max(0, card.stats.latencyMs || 0) * 0.05;
  if (!held) value += 12; // an empty slot is a wasted part of the model
  if (me.metrics.score + net >= arena.targetScore) value += WINNING_MOVE;

  return value;
}

export function botMove(state, side = 'p2') {
  const affordable = state[side].hand.filter((c) => c.cost <= state[side].energy);
  if (!affordable.length) return null;

  let best = null;
  let bestScore = -Infinity;
  for (const card of affordable) {
    const value = scoreMove(state, side, card);
    if (value > bestScore) {
      bestScore = value;
      best = card;
    }
  }
  return best?.instanceId ?? null;
}

// The guest must never see the host's hand.
export function maskFor(state, viewer) {
  const hidden = other(viewer);
  const masked = structuredClone(state);
  masked[hidden] = { ...masked[hidden], hand: [], handCount: state[hidden].hand.length };
  return masked;
}

export const validDeck = (ids) => {
  const valid = (ids || []).filter((id) => ALL_CARDS.some((c) => c.id === id));
  return valid.length >= 4 ? valid : ALL_CARDS.filter((c) => c.unlockedDefault).map((c) => c.id);
};
