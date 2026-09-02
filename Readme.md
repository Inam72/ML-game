AI Architect Duel

A two-player card game that teaches how modern machine-learning systems are actually built. You assemble a model out of real components — a backbone, an attention mechanism, an optimizer and a defence — and race a rival to hit a target metric in a real-world arena. Every card carries a plain-English explanation written for a curious high-school reader, so the ML content is learned through play rather than read as a lecture.

No maths background required. No account, no server, no install to try it — it runs entirely in the browser.

What it is

Machine learning is usually taught as equations first and intuition later. This flips it. A Mixture-of-Experts backbone isn't a formula here, it's a card that costs 3 compute and gives you a big accuracy jump — and when you tap it, it tells you why: many small expert networks and a router that picks one or two per input, so the model holds enormous knowledge while only running a slice of itself each time. You learn the trade-off by paying for it.

Sabotage cards are genuine failure modes, not fantasy attacks. Compute energy is a GPU budget. Arenas are places ML actually gets used, each with the metric that field genuinely cares about.

What it teaches:

Game concept	The real idea behind it
Backbone slot	Model architectures — Mixture-of-Experts, Vision Transformers, Mamba state space models, ConvNeXt
Attention slot	FlashAttention, rotary position embeddings, gated activations
Optimizer slot	AdamW with warmup and cosine decay, the Lion optimizer
Defence slot	Gradient clipping, spectral normalization
Sabotage cards	Real failure modes — exploding gradients and NaN loss, GPU out-of-memory, distribution shift
Compute energy	Training under a fixed GPU budget: the best method you cannot afford is worth nothing
Training health	Runs crash. A model that diverges scores zero regardless of how clever it was
Arenas	Where ML is used — particle physics, self-driving, medical imaging, exoplanet search, weather forecasting, sonar, brain–computer interfaces

Fourteen cards in total: four backbones, three attention mechanisms, two optimizers, two defences and three sabotages. Seven are unlocked from the start; the other seven are earned by winning duels.

Eight arenas, each with its own target metric, turn limit and difficulty — and each granting a 35% bonus to one card type. Matching the method to the problem is the whole game, and it is the same judgement call a real practitioner makes.

How to play

Both players start identical: 18% on the arena metric, 2.5 loss, 100 ms latency and 100% training health, holding five cards.

Pick a mode — Practice duel (vs. the rival lab AI) or Play a Friend (one player hosts and shares a five-letter room code, the other joins).
Build your model — you have four slots: Backbone, Attention, Optimizer, Defence.
Take your turn — play exactly one card, then your turn ends automatically. Compute regenerates each turn as min(6, 3 + turn/2), cards cost 1 to 3 compute, and you draw back up to five cards. Unaffordable cards are dimmed in your hand.
Read before you play — tap any card to see a plain-English explanation of what it does before committing to it.
Install upgrades freely — playing a card into a slot you've already filled still adds its full boost, so upgrading mid-duel is a real strategy.
Use sabotage wisely — it targets your rival's training health instead of boosting your own stats. It's a wasted turn early and a game-winner late.
Watch the arena bonus — each arena boosts one card type by 35%, so the right card in the wrong arena is weaker than the same card played to its strength. Scores cap at 99.9%.

A duel ends one of three ways:

Hit the target metric — the arena's number, reached first.
Crash the rival — drive their training health to zero with sabotage.
Run out of compute budget — when the turn limit passes, the higher score wins; equal scores draw.

Winning grants 250 XP, a level, and unlocks a new card for your deck. Use the Deck builder to pick 4–8 cards from what you've unlocked — every card is explained there too, so it doubles as a reference.

How to run it locally
bash
npm install
npm start        # dev server on http://localhost:5173
npm test         # 36 tests: engine rules, bot behaviour, screens, full click-through duel
npm run build    # production bundle in dist/

In GitHub Codespaces the dev server is already configured for the forwarded HTTPS URL (server.allowedHosts and the HMR client port are set in vite.config.js).

Stack: React 18, Vite 8, Vitest + Testing Library, PeerJS. No CSS framework, no state library — the whole thing is plain React and one stylesheet.

Deploying

The game is fully static — multiplayer runs browser-to-browser — so any static host works. netlify.toml is included and needs no configuration:

Build command: npm run build
Publish directory: dist
SPA redirect: every path serves index.html
How multiplayer works

There is no game server. The player who hosts also runs the rules:

The guest sends intents (PLAY, END_TURN) over a WebRTC data channel.
The host applies them with the same pure engine that runs solo play, then broadcasts the new state.
Before sending, the host masks its own hand — the guest only ever learns how many cards the host holds, never which ones.

Because the engine looks a card up only in the hand of the player who sent the intent, a modified client cannot play cards it does not hold.

Peer discovery uses the public PeerJS broker. Room codes are five characters drawn from an alphabet with no look-alikes (no O/0, no I/1). The broker only keeps a room registered while the hosting tab holds its socket open, and browsers throttle background tabs hard enough to drop it, so the host keeps the registration alive and a joining guest retries four times before giving up.

Two caveats worth knowing:

Some school and workplace networks block WebRTC entirely; a phone hotspot is the usual workaround.
If a connection drops mid-duel, the match ends rather than reconnecting.
