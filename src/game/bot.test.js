import { describe, expect, test } from 'vitest';
import { botMove, createDuel, endTurn, playCard, scoreMove } from './engine';
import { ARENAS } from './arenas';
import { ALL_CARDS } from './cards';

const FULL_POOL = ALL_CARDS.map((c) => c.id);

// A stand-in for a player who knows the rules but not the strategy.
function randomMove(state, side) {
  const affordable = state[side].hand.filter((c) => c.cost <= state[side].energy);
  if (!affordable.length) return null;
  return affordable[Math.floor(Math.random() * affordable.length)].instanceId;
}

// Always builds, never attacks, never defends — the obvious naive strategy.
function greedyScoreMove(state, side) {
  const affordable = state[side].hand.filter((c) => c.cost <= state[side].energy && c.type !== 'SABOTAGE');
  if (!affordable.length) return randomMove(state, side);
  return affordable.sort((a, b) => (b.stats.accBoost || 0) - (a.stats.accBoost || 0))[0].instanceId;
}

function playGame(arena, p1Strategy, p2Strategy) {
  let state = createDuel({ arena, p1Name: 'P1', p1Deck: FULL_POOL, p2Name: 'P2', p2Deck: FULL_POOL });
  let guard = 0;

  while (!state.winner && guard++ < 100) {
    const m1 = p1Strategy(state, 'p1');
    if (m1) state = playCard(state, 'p1', m1);
    if (state.winner) break;

    const m2 = p2Strategy(state, 'p2');
    if (m2) state = playCard(state, 'p2', m2);
    if (state.winner) break;

    state = endTurn(endTurn(state, 'p1'), 'p2');
  }
  return state;
}

function winRate(arena, opponent, games = 120) {
  let wins = 0;
  for (let i = 0; i < games; i++) {
    // Alternate seats so neither strategy benefits from moving first.
    const botIsP1 = i % 2 === 0;
    const result = botIsP1
      ? playGame(arena, botMove, opponent)
      : playGame(arena, opponent, botMove);
    const botSide = botIsP1 ? 'p1' : 'p2';
    if (result.winner === botSide) wins++;
  }
  return wins / games;
}

// Thresholds are set below the rates measured over 600-game samples, with room
// for run-to-run variance: ~82% against random play, and ~54% against a greedy
// score-chaser. Score in this game is cumulative, which makes always playing
// the biggest boost a genuinely strong line, so beating it at all is the bar.
describe('the bot is a real opponent', () => {
  test('beats random play convincingly', () => {
    const rate = winRate(ARENAS[0], randomMove, 200);
    expect(rate, `win rate ${rate}`).toBeGreaterThan(0.7);
  }, 30000);

  test('stays ahead of a naive score-chaser that never attacks or defends', () => {
    const rate = winRate(ARENAS[0], greedyScoreMove, 200);
    expect(rate, `win rate ${rate}`).toBeGreaterThan(0.45);
  }, 30000);

  test('holds up across every arena', () => {
    for (const arena of ARENAS) {
      const rate = winRate(arena, randomMove, 60);
      expect(rate, `${arena.name} win rate ${rate}`).toBeGreaterThan(0.6);
    }
  }, 60000);

  test('finishes games rather than stalling to the turn limit', () => {
    let decisive = 0;
    for (let i = 0; i < 40; i++) {
      const result = playGame(ARENAS[0], botMove, randomMove);
      if (result.endReason && !/compute budget/i.test(result.endReason)) decisive++;
    }
    expect(decisive).toBeGreaterThan(20);
  }, 30000);
});

describe('bot judgement in specific spots', () => {
  const spot = (arena, mutate) => {
    const state = createDuel({ arena, p1Name: 'You', p1Deck: FULL_POOL, p2Name: 'Bot', p2Deck: FULL_POOL });
    mutate(state);
    return state;
  };
  const card = (id, i = 0) => ({ ...ALL_CARDS.find((c) => c.id === id), instanceId: `${id}-${i}` });

  test('prefers raw score over tidying slots on the final turn', () => {
    const state = spot(ARENAS[0], (s) => {
      s.turn = s.arena.maxTurns; // last turn
      s.p2.energy = 6;
      s.p2.metrics.score = 60;
      s.p1.metrics.score = 70; // behind, so score is the only thing that matters
      s.p2.hand = [card('c_vit_huge'), card('c_grad_clip')];
    });
    const chosen = state.p2.hand.find((c) => c.instanceId === botMove(state));
    expect(chosen.id).toBe('c_vit_huge');
  });

  test('values a score-knocking attack more when the rival is nearly home', () => {
    const attack = card('c_atk_covariate');
    const calm = spot(ARENAS[0], (s) => {
      s.p1.metrics.score = 20;
    });
    const urgent = spot(ARENAS[0], (s) => {
      s.p1.metrics.score = 90; // one good card from winning
    });
    expect(scoreMove(urgent, 'p2', attack)).toBeGreaterThan(scoreMove(calm, 'p2', attack));
  });

  test('never picks a card it cannot pay for', () => {
    const state = spot(ARENAS[0], (s) => {
      s.p2.energy = 1;
      s.p2.hand = [card('c_llama3_moe'), card('c_vit_huge'), card('c_rope_embed')];
    });
    const chosen = state.p2.hand.find((c) => c.instanceId === botMove(state));
    expect(chosen.cost).toBeLessThanOrEqual(1);
  });
});
