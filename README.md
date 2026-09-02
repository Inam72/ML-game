# AI Architect Duel

A card game that teaches how modern machine-learning systems are actually built. Players stack a
model out of real components — a backbone, an attention mechanism, an optimizer and a defence — and
race a rival to hit a target metric in a real-world arena. Every card carries a plain-English
explanation, so the ML content is learned through play rather than read as a lecture.

Written for high-school age and up. No maths background required.

## What it teaches

| Game concept | Real idea behind it |
| --- | --- |
| Backbone slot | Model architectures: Mixture-of-Experts, Vision Transformers, state space models, ConvNeXt |
| Attention slot | FlashAttention, rotary position embeddings, gated activations |
| Optimizer slot | AdamW with warmup and cosine decay, the Lion optimizer |
| Defence slot | Gradient clipping, spectral normalization |
| Sabotage cards | Genuine failure modes: exploding gradients and NaN loss, GPU out-of-memory, distribution shift |
| Compute energy | Training under a limited GPU budget |
| Arenas | Where ML gets used: particle physics, self-driving, medical imaging, exoplanet search, weather, BCI |

Arenas grant a 35% bonus to one card type, so the winning strategy depends on matching the method to
the problem — the same judgement call a real practitioner makes.

## Playing

**Practice duel** — play the rival lab AI. Best way to learn the cards.

**Play a friend** — one player hosts and gets a five-letter room code; the other types it in on the
hub screen. The two browsers connect directly to each other over WebRTC, so there is no server to run
and no account to create.

Tap any card to read what it really does before committing to play it.

## Running locally

```bash
npm install
npm start        # dev server on http://localhost:5173
npm test         # engine rules + screen rendering + a full click-through duel
npm run build    # production bundle in dist/
```

In GitHub Codespaces the dev server is already configured for the forwarded HTTPS URL
(`server.allowedHosts` and the HMR client port are set in `vite.config.js`).

## Deploying

The whole game is static — multiplayer runs browser-to-browser — so any static host works.
`netlify.toml` is included and needs no configuration:

- Build command: `npm run build`
- Publish directory: `dist`

## How multiplayer works

There is no game server. The player who hosts also runs the rules:

1. The guest sends **intents** (`PLAY`, `END_TURN`) over a WebRTC data channel.
2. The host applies them with the same pure engine used in solo play, then broadcasts the new state.
3. Before sending, the host masks its own hand, so the guest only ever learns how many cards the host
   holds — never which ones.

Because the engine looks a card up only in the hand of the player who sent the intent, a modified
client cannot play cards it does not hold.

Peer discovery uses the public PeerJS broker. Two caveats worth knowing:

- Some school and workplace networks block WebRTC; a phone hotspot is the usual workaround.
- If a connection drops mid-duel, the match ends rather than reconnecting.

## Layout

```
src/
  game/       cards.js, arenas.js, engine.js — all rules, no React
  net/peer.js WebRTC host/join wrapper
  screens/    one file per screen
  components/ shared card rendering
```

The engine is pure functions over a state object, which is why the same code runs both solo play and
the online host, and why the rules are straightforward to unit-test.
