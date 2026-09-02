// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

afterEach(cleanup);

const hand = () => document.querySelector('.hand');
const learnBar = () => document.querySelector('.learn--bar');

async function startSoloDuel() {
  const user = userEvent.setup({ delay: null });
  render(<App />);

  await user.click(screen.getByRole('button', { name: /next/i }));
  await user.click(screen.getByRole('button', { name: /next/i }));
  await user.type(screen.getByRole('textbox'), 'Ada');
  await user.click(screen.getByRole('button', { name: /start playing/i }));

  await user.click(screen.getByRole('button', { name: /practice duel/i }));
  await user.click(screen.getByRole('button', { name: /CERN Particle Collider/i }));
  return user;
}

describe('solo duel flow', () => {
  test('playing a card is the whole turn — no end-turn button needed', async () => {
    const user = await startSoloDuel();

    expect(screen.getByText('Your model')).toBeDefined();
    expect(screen.getByText(/play one card — that ends your turn/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /end turn/i })).toBeNull();
    expect(screen.getByText(/tap a card in your hand/i)).toBeDefined();

    // Pick a card the player can actually afford this turn.
    const affordable = within(hand())
      .getAllByRole('button')
      .find((btn) => !btn.closest('.gcard').className.includes('is-disabled'));
    const cardName = affordable.querySelector('.gcard__name').textContent;
    await user.click(affordable);

    // Selecting explains the card before committing to it.
    expect(within(learnBar()).getByText(cardName)).toBeDefined();

    await user.click(within(learnBar()).getByRole('button'));

    expect(within(hand()).getAllByRole('button')).toHaveLength(4);

    // The turn ends on the play itself: the rival lab answers on a short
    // delay, then the turn advances with no further click.
    await waitFor(() => expect(screen.getByText(/Turn 2\/8/)).toBeDefined(), { timeout: 4000 });
  }, 20000);

  test('unaffordable cards cannot be played', async () => {
    await startSoloDuel();

    const tooPricey = within(hand())
      .getAllByRole('button')
      .filter((btn) => Number(btn.querySelector('.gcard__cost').textContent.replace(/\D/g, '')) > 3);

    for (const card of tooPricey) {
      expect(card.closest('.gcard').className).toContain('is-disabled');
    }
  }, 20000);

  test('the deck builder explains a card and can swap it out', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.click(screen.getByRole('button', { name: /start playing/i }));
    await user.click(screen.getByRole('button', { name: /your deck/i }));

    // The learn panel starts on the first card and follows what you tap.
    const panel = document.querySelector('.learn--sticky');
    expect(panel.querySelector('.learn__title').textContent).toMatch(/Mixture-of-Experts/);

    const removable = screen.getAllByRole('button', { name: /in deck — remove/i });
    const before = removable.length;
    await user.click(removable[0]);

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /in deck — remove/i })).toHaveLength(before - 1)
    );
  }, 20000);
});
