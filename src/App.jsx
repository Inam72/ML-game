import React, { useState } from 'react';

// ============================================================================
// 1. MASTER CARD DATABASE - SOTA MACHINE LEARNING PIPELINE CARDS
// ============================================================================
const ALL_CARDS = [
  // --- ARCHITECTURE BACKBONES (MONSTER CARDS) ---
  {
    id: 'c_llama3_moe',
    name: 'LLaMA-3 MoE Backbone',
    type: 'BACKBONE',
    slot: 'model',
    tier: 1,
    cost: 3,
    stats: { accBoost: 32, lossReduce: 0.8, latencyMs: 65, vramGb: 8 },
    desc: '8x7B Mixture of Experts routing sparse activations to top-2 sub-networks.',
    eduInfo: 'Mixture-of-Experts (MoE) replaces dense FFN layers with sparsely gated expert sub-networks. A router network selects top-k experts per token, scaling capacity without proportional FLOP increases.',
    unlockedDefault: true
  },
  {
    id: 'c_vit_huge',
    name: 'Vision Transformer (ViT-H)',
    type: 'BACKBONE',
    slot: 'model',
    tier: 1,
    cost: 3,
    stats: { accBoost: 28, lossReduce: 0.65, latencyMs: 40, vramGb: 6 },
    desc: '14x14 patch projection with global self-attention across image tokens.',
    eduInfo: 'ViT tokenizes image patches (e.g. 16x16 pixels) into linear embeddings, injecting learnable positional encodings before processing through standard Transformer encoder stacks.',
    unlockedDefault: true
  },
  {
    id: 'c_mamba2',
    name: 'Mamba-2 State Space Model',
    type: 'BACKBONE',
    slot: 'model',
    tier: 2,
    cost: 2,
    stats: { accBoost: 24, lossReduce: 0.55, latencyMs: 12, vramGb: 3 },
    desc: 'Selective SSM linear-time sequence processing. Zero O(N²) memory wall.',
    eduInfo: 'Mamba-2 replaces multi-head attention with hardware-aware Selective State Space Models (SSM), computing continuous-time recurrent state expansions in linear O(N) time.',
    unlockedDefault: false
  },
  {
    id: 'c_convnext',
    name: 'ConvNeXt-X 3D Network',
    type: 'BACKBONE',
    slot: 'model',
    tier: 3,
    cost: 2,
    stats: { accBoost: 26, lossReduce: 0.6, latencyMs: 22, vramGb: 4 },
    desc: '7x7 depthwise separable convolutions with inverted bottleneck design.',
    eduInfo: 'ConvNeXt modernizes traditional CNNs by incorporating Transformer design choices: 7x7 depthwise convolutions, GELU activations, and LayerNorm in place of BatchNorm.',
    unlockedDefault: false
  },

  // --- ATTENTION & LAYER NODES (EQUIP/SPELL CARDS) ---
  {
    id: 'c_flash_attn3',
    name: 'FlashAttention-3 Engine',
    type: 'ATTENTION',
    slot: 'attention',
    tier: 1,
    cost: 2,
    stats: { accBoost: 14, lossReduce: 0.25, latencyMs: -35, vramGb: -2 },
    desc: 'Asynchronous SRAM tiling for IO-aware exact self-attention computation.',
    eduInfo: 'FlashAttention-3 reorganizes softmax reduction to avoid slow GPU High Bandwidth Memory (HBM) reads/writes, fusing attention kernels directly inside SRAM cache.',
    unlockedDefault: true
  },
  {
    id: 'c_rope_embed',
    name: 'Rotary Embeddings (RoPE)',
    type: 'ATTENTION',
    slot: 'attention',
    tier: 1,
    cost: 1,
    stats: { accBoost: 10, lossReduce: 0.2, latencyMs: 5, vramGb: 0 },
    desc: 'Encodes relative position by rotating Query/Key vectors in complex plane.',
    eduInfo: 'RoPE applies a complex rotation matrix to Query and Key projections, naturally preserving relative distance decays without absolute position lookup tables.',
    unlockedDefault: true
  },
  {
    id: 'c_swiglu',
    name: 'SwiGLU Activation Gate',
    type: 'ATTENTION',
    slot: 'attention',
    tier: 2,
    cost: 1,
    stats: { accBoost: 8, lossReduce: 0.18, latencyMs: 2, vramGb: 1 },
    desc: 'Swish-Gated Linear Unit providing smooth gradient propagation bounds.',
    eduInfo: 'SwiGLU computes Swish(xW) * (xV). Gated linear activations consistently outperform standard ReLU/GELU in Transformer Feed-Forward Networks.',
    unlockedDefault: false
  },

  // --- OPTIMIZERS & SCHEDULERS (HYPERPARAMETER SPELLS) ---
  {
    id: 'c_adamw_decay',
    name: 'AdamW + Cosine Warmup',
    type: 'OPTIMIZER',
    slot: 'optimizer',
    tier: 1,
    cost: 1,
    stats: { accBoost: 12, lossReduce: 0.3, latencyMs: 0, vramGb: 1 },
    desc: 'Decoupled weight decay regularization with linear warmup & cosine decay.',
    eduInfo: 'AdamW separates L2 norm weight decay from adaptive first/second moment gradient estimates, preventing decay scaling distortion on active parameters.',
    unlockedDefault: true
  },
  {
    id: 'c_lion_opt',
    name: 'Lion Optimizer (Evo-Discovered)',
    type: 'OPTIMIZER',
    slot: 'optimizer',
    tier: 2,
    cost: 1,
    stats: { accBoost: 15, lossReduce: 0.35, latencyMs: -5, vramGb: -1 },
    desc: 'Sign-based momentum optimization discovered via program search.',
    eduInfo: 'Lion tracks only momentum (first moment), using the sign operation to apply uniform update magnitudes across all parameter weights.',
    unlockedDefault: false
  },

  // --- REGULARIZATION & DEFENSE (TRAP/DEFENSE CARDS) ---
  {
    id: 'c_grad_clip',
    name: 'Gradient Norm Clipper (||g||<=1.0)',
    type: 'DEFENSE',
    slot: 'defense',
    tier: 1,
    cost: 1,
    stats: { stabilityBoost: 40, lossReduce: 0.1, latencyMs: 1, vramGb: 0 },
    desc: 'Clips gradient vector L2 norm to 1.0. Immunizes model against explosion traps.',
    eduInfo: 'Gradient clipping rescales gradient vectors whenever their norm exceeds threshold c: g = g * min(1, c / ||g||), preventing destabilization in deep networks.',
    unlockedDefault: true
  },
  {
    id: 'c_spectral_norm',
    name: 'Spectral Decoupling Regularizer',
    type: 'DEFENSE',
    slot: 'defense',
    tier: 2,
    cost: 1,
    stats: { stabilityBoost: 30, lossReduce: 0.15, latencyMs: 3, vramGb: 0 },
    desc: 'Penalizes spectral radius of weight matrices to prevent adversarial collapse.',
    eduInfo: 'Spectral normalization bounds the Lipschitz constant of network layers by dividing weight matrices by their largest singular value (spectral norm).',
    unlockedDefault: false
  },

  // --- SABOTAGE & ATTACK CARDS (FIELD TRAPS) ---
  {
    id: 'c_atk_nan_explosion',
    name: 'Gradient Explosion (NaN Trap)',
    type: 'SABOTAGE',
    slot: 'target',
    tier: 1,
    cost: 2,
    stats: { targetStability: -45, targetLossSpike: 0.85 },
    desc: 'Injects unnormalized loss spikes. Forces opponent parameter tensor to NaN.',
    eduInfo: 'Exploding gradients cause parameter updates to overflow 32-bit floating point representations, crashing backpropagation with NaN loss values.',
    unlockedDefault: true
  },
  {
    id: 'c_atk_vram_oom',
    name: 'GPU VRAM Memory Spike (OOM)',
    type: 'SABOTAGE',
    slot: 'target',
    tier: 2,
    cost: 2,
    stats: { targetLatencyMs: 60, targetStability: -25 },
    desc: 'Fills GPU activation memory buffer. Triggers Out-Of-Memory CUDA fault.',
    eduInfo: 'OOM errors occur when activation tensors stored for backpropagation exceed physical VRAM limits, forcing fallback memory paging or hardware execution aborts.',
    unlockedDefault: false
  },
  {
    id: 'c_atk_covariate',
    name: 'Adversarial Covariate Shift',
    type: 'SABOTAGE',
    slot: 'target',
    tier: 3,
    cost: 3,
    stats: { targetAcc: -22, targetLossSpike: 0.6 },
    desc: 'Injects out-of-distribution noise into training mini-batches.',
    eduInfo: 'Covariate shift shifts feature space marginal distribution P(X) while keeping conditional distribution P(Y|X) constant, invalidating learned decision boundaries.',
    unlockedDefault: false
  }
];

// ============================================================================
// 2. EXPANDED HIGH-STAKES ARENA SELECTION (8 DISTINCT REAL-WORLD MATRICES)
// ============================================================================
const ARENAS = [
  {
    id: 'arena_cern',
    name: 'CERN Hadron Collider Sub-Dimensional Matrix',
    metricName: 'Signal Detection AUC',
    targetScore: 94.5,
    maxTurns: 8,
    bonusType: 'BACKBONE',
    desc: 'Filter 100 Petabytes of sensor telemetry to isolate exotic Higgs boson decay tracks.',
    bgTheme: '#0a192f'
  },
  {
    id: 'arena_tokyo',
    name: 'Tokyo Autonomous Urban LiDAR Grid',
    metricName: '3D Segmentation mIoU',
    targetScore: 88.0,
    maxTurns: 8,
    bonusType: 'ATTENTION',
    desc: 'Sub-millisecond 3D point-cloud segmentation for 50,000 autonomous vehicle swarms.',
    bgTheme: '#1a002c'
  },
  {
    id: 'arena_wallstreet',
    name: 'Wall Street High-Frequency Dark Pool',
    metricName: 'Orderbook Accuracy (%)',
    targetScore: 91.0,
    maxTurns: 6,
    bonusType: 'OPTIMIZER',
    desc: 'Predict microsecond liquidity shifts under extreme, noisy market orderbook volatility.',
    bgTheme: '#022013'
  },
  {
    id: 'arena_bioneura',
    name: 'BioNeura Oncology Diagnostic Matrix',
    metricName: 'Diagnostic Sensitivity (%)',
    targetScore: 96.0,
    maxTurns: 10,
    bonusType: 'DEFENSE',
    desc: '3D MRI volumetric tumor segmentation. High penalty for false negatives in clinical deployment.',
    bgTheme: '#210008'
  },
  {
    id: 'arena_nasa_exoplanet',
    name: 'NASA Kepler Deep Space Spectrometry',
    metricName: 'Transit Signal Recall (%)',
    targetScore: 95.0,
    maxTurns: 8,
    bonusType: 'BACKBONE',
    desc: 'Process faint photometric light curves to identify Earth-sized exoplanet transits across distant stars.',
    bgTheme: '#031b33'
  },
  {
    id: 'arena_typhoon_net',
    name: 'Pacific Atmospheric Typhoon Trajectory',
    metricName: 'Windfield Vector RMSE',
    targetScore: 92.5,
    maxTurns: 7,
    bonusType: 'ATTENTION',
    desc: 'Global multi-modal satellite weather forecasting. Model attention must resolve localized pressure eye gradients.',
    bgTheme: '#122620'
  },
  {
    id: 'arena_subsea_drone',
    name: 'Abyssal Trench Autonomous Exploration Drone',
    metricName: 'Sonar Depth Resolution',
    targetScore: 89.5,
    maxTurns: 6,
    bonusType: 'DEFENSE',
    desc: 'Deep-ocean underwater acoustic SLAM. High noise immunity required against sonar backscatter signals.',
    bgTheme: '#051821'
  },
  {
    id: 'arena_bci_neural',
    name: 'Neurosurgical Motor-Cortex BCI Grid',
    metricName: 'Signal Decoding Fidelity',
    targetScore: 97.2,
    maxTurns: 9,
    bonusType: 'OPTIMIZER',
    desc: 'Decode 1,024-channel invasive neural spike trains in real-time to control prosthetic limb kinematics.',
    bgTheme: '#2b091f'
  }
];

export default function App() {
  // Navigation State: 'INTRO' | 'HUB' | 'DECK_BUILDER' | 'ARENA_SELECT' | 'DUEL' | 'VICTORY'
  const [screen, setScreen] = useState('INTRO');
  
  // Player Progression
  const [username, setUsername] = useState('');
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerXp, setPlayerXp] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState(['c_llama3_moe', 'c_vit_huge', 'c_flash_attn3', 'c_rope_embed', 'c_adamw_decay', 'c_grad_clip', 'c_atk_nan_explosion']);
  const [activeDeck, setActiveDeck] = useState(['c_llama3_moe', 'c_flash_attn3', 'c_rope_embed', 'c_adamw_decay', 'c_grad_clip', 'c_atk_nan_explosion']);

  // Match State
  const [selectedArena, setSelectedArena] = useState(ARENAS[0]);
  const [turn, setTurn] = useState(1);
  const [computeEnergy, setComputeEnergy] = useState(3);
  const [hasPlayedCardThisTurn, setHasPlayedCardThisTurn] = useState(false); // STRICT 1 CARD PER TURN RULE
  const [inspectCard, setInspectCard] = useState(null);
  const [duelLog, setDuelLog] = useState([]);

  // Architecture Slots State (Player & AI)
  const [playerArch, setPlayerArch] = useState({ model: null, attention: null, optimizer: null, defense: null });
  const [opponentArch, setOpponentArch] = useState({ model: null, attention: null, optimizer: null, defense: null });

  // Evaluation Metrics State
  const [playerMetrics, setPlayerMetrics] = useState({ score: 15.0, loss: 2.8, latency: 120, stability: 100 });
  const [opponentMetrics, setOpponentMetrics] = useState({ score: 12.0, loss: 3.1, latency: 110, stability: 100 });

  // Player Hand
  const [playerHand, setPlayerHand] = useState([]);

  // Forced Intro Calibration Steps
  const [introStep, setIntroStep] = useState(0);

  // Helper: Draw cards from active deck
  const drawHand = (count = 5) => {
    const deckCards = ALL_CARDS.filter((c) => activeDeck.includes(c.id));
    const hand = [];
    for (let i = 0; i < count; i++) {
      const rand = deckCards[Math.floor(Math.random() * deckCards.length)];
      hand.push({ ...rand, instanceId: Math.random().toString() });
    }
    return hand;
  };

  const startMatch = (arena) => {
    setSelectedArena(arena);
    setTurn(1);
    setComputeEnergy(3);
    setHasPlayedCardThisTurn(false);
    setPlayerArch({ model: null, attention: null, optimizer: null, defense: null });
    setOpponentArch({ model: null, attention: null, optimizer: null, defense: null });
    setPlayerMetrics({ score: 18.0, loss: 2.5, latency: 100, stability: 100 });
    setOpponentMetrics({ score: 15.0, loss: 2.7, latency: 95, stability: 100 });
    setPlayerHand(drawHand(5));
    setDuelLog([
      `⚔️ DUEL INITIALIZED IN [${arena.name.toUpperCase()}]!`,
      `Goal: Reach ${arena.targetScore}% ${arena.metricName} before Turn ${arena.maxTurns}.`,
      `RULE ENFORCED: Exactly 1 card play allowed per turn.`
    ]);
    setScreen('DUEL');
  };

  const addLog = (msg) => {
    setDuelLog((prev) => [msg, ...prev.slice(0, 6)]);
  };

  // Play Card Into Architecture Pipeline Zone (STRICT 1 CARD PER TURN)
  const handlePlayCard = (card) => {
    if (hasPlayedCardThisTurn) {
      addLog(`⚠️ RULE VIOLATION: Only 1 card play permitted per turn! Click "EXECUTE EPOCH" to end turn.`);
      return;
    }

    if (computeEnergy < card.cost) {
      addLog(`⚠️ Insufficient Compute Energy! Requires ⚡${card.cost}`);
      return;
    }

    setComputeEnergy((prev) => prev - card.cost);
    setHasPlayedCardThisTurn(true);

    if (card.type === 'SABOTAGE') {
      // Attack Opponent Architecture & Stability
      setOpponentMetrics((prev) => {
        const nextStab = Math.max(0, prev.stability + (card.stats.targetStability || 0));
        const nextLoss = Number((prev.loss + (card.stats.targetLossSpike || 0)).toFixed(2));
        const nextLat = prev.latency + (card.stats.targetLatencyMs || 0);
        const nextScore = Math.max(0, prev.score + (card.stats.targetAcc || 0));
        return { score: nextScore, loss: nextLoss, latency: nextLat, stability: nextStab };
      });
      addLog(`💥 ATTACK! Deployed [${card.name}] onto Opponent Neural Pipeline!`);
    } else {
      // Equip into Player Architecture Slot
      setPlayerArch((prev) => ({ ...prev, [card.slot]: card }));

      // Recalculate Evaluation Metrics
      setPlayerMetrics((prev) => {
        let domainBonus = 1.0;
        if (card.type === selectedArena.bonusType) domainBonus = 1.35;

        const nextScore = Math.min(99.9, prev.score + Math.round((card.stats.accBoost || 0) * domainBonus));
        const nextLoss = Math.max(0.01, Number((prev.loss - (card.stats.lossReduce || 0)).toFixed(2)));
        const nextLat = Math.max(5, prev.latency + (card.stats.latencyMs || 0));
        const nextStab = Math.min(100, prev.stability + (card.stats.stabilityBoost || 0));

        return { score: nextScore, loss: nextLoss, latency: nextLat, stability: nextStab };
      });

      addLog(`🛠️ MOUNTED [${card.name}] into ${card.slot.toUpperCase()} Slot!`);
    }

    // Remove played card from hand
    setPlayerHand((prev) => prev.filter((c) => c.instanceId !== card.instanceId));

    // Check Victory
    checkDuelEnd();
  };

  // Turn Execution (Player End Turn -> AI Opponent Construct & Evaluate)
  const handleEndTurn = () => {
    addLog(`⌛ Turn ${turn} Build Phase Completed. Executing Training Epoch...`);

    // AI Turn Mechanics
    setTimeout(() => {
      // AI plays 1 card per turn rule as well
      const unplacedSlots = ['model', 'attention', 'optimizer', 'defense'].filter((s) => !opponentArch[s]);
      if (unplacedSlots.length > 0) {
        const fillSlot = unplacedSlots[0];
        const candidateCard = ALL_CARDS.find((c) => c.slot === fillSlot);
        if (candidateCard) {
          setOpponentArch((prev) => ({ ...prev, [fillSlot]: candidateCard }));
          setOpponentMetrics((prev) => ({
            ...prev,
            score: Math.min(98, prev.score + candidateCard.stats.accBoost),
            loss: Math.max(0.05, Number((prev.loss - candidateCard.stats.lossReduce).toFixed(2)))
          }));
          addLog(`🤖 AI Opponent mounted [${candidateCard.name}] into its pipeline.`);
        }
      } else {
        // AI Attacks Player
        setPlayerMetrics((prev) => ({
          ...prev,
          stability: Math.max(0, prev.stability - 18),
          loss: Number((prev.loss + 0.2).toFixed(2))
        }));
        addLog(`🤖 AI Opponent executed Gradient Overfitting attack against your model!`);
      }

      // Next Turn Setup
      setTurn((prev) => prev + 1);
      setComputeEnergy(Math.min(6, 3 + Math.floor((turn + 1) / 2)));
      setHasPlayedCardThisTurn(false); // RESET 1-CARD PER TURN RULE FOR NEXT TURN
      setPlayerHand((prev) => (prev.length < 5 ? [...prev, ...drawHand(1)] : prev));

      checkDuelEnd();
    }, 1000);
  };

  const checkDuelEnd = () => {
    if (playerMetrics.score >= selectedArena.targetScore || opponentMetrics.stability <= 0) {
      triggerWin(true);
    } else if (opponentMetrics.score >= selectedArena.targetScore || playerMetrics.stability <= 0 || turn >= selectedArena.maxTurns) {
      triggerWin(false);
    }
  };

  const triggerWin = (isPlayerWinner) => {
    if (isPlayerWinner) {
      setPlayerXp((prev) => prev + 250);
      setPlayerLevel((prev) => prev + 1);

      // Unlock new Tier card
      const lockedCards = ALL_CARDS.filter((c) => !unlockedIds.includes(c.id));
      if (lockedCards.length > 0) {
        const newlyUnlocked = lockedCards[0];
        setUnlockedIds((prev) => [...prev, newlyUnlocked.id]);
        addLog(`🏆 VICTORY! Level Up -> Unlocked [${newlyUnlocked.name}]!`);
      }
    }
    setScreen('VICTORY');
  };

  const toggleDeckCard = (cardId) => {
    if (activeDeck.includes(cardId)) {
      if (activeDeck.length > 4) {
        setActiveDeck((prev) => prev.filter((id) => id !== cardId));
      }
    } else {
      if (activeDeck.length < 8) {
        setActiveDeck((prev) => [...prev, cardId]);
      }
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* ==================================================================== */}
      {/* 1. FORCED INTRO & NEURAL SYSTEM CALIBRATION TUTORIAL */}
      {/* ==================================================================== */}
      {screen === 'INTRO' && (
        <div style={styles.introCard}>
          <div style={styles.cyberHeader}>SYSTEM AUTHENTICATION & CALIBRATION</div>
          <h1 style={styles.titleGlow}>AI ARCHITECT: DUEL MATRIX</h1>
          <p style={styles.introSub}>Yu-Gi-Oh Style Machine Learning Pipeline Strategy</p>

          <div style={styles.tutorialBox}>
            {introStep === 0 && (
              <div>
                <h3 style={styles.stepTitle}>STEP 1: ARCHITECT CREDENTIALS</h3>
                <p style={styles.stepBody}>Enter your callsign to calibrate neural workspace and access duel matrices.</p>
                <input
                  type="text"
                  placeholder="e.g. PROF_LECKUN_AI"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.textInput}
                />
              </div>
            )}

            {introStep === 1 && (
              <div>
                <h3 style={styles.stepTitle}>STEP 2: PIPELINE SLOTS & 1-CARD/TURN RULE</h3>
                <p style={styles.stepBody}>
                  Build neural architecture stacks: <strong>Backbone + Attention + Optimizer + Defense</strong>.
                  <br /><br />
                  <span style={{ color: '#ffd700', fontWeight: 'bold' }}>⚠️ STRICT TURN RULE:</span> You can only play <strong>1 Card Per Turn</strong>. Choose your pipeline component or attack carefully before executing the training epoch!
                </p>
              </div>
            )}

            {introStep === 2 && (
              <div>
                <h3 style={styles.stepTitle}>STEP 3: SABOTAGE & ARENA OBJECTIVES</h3>
                <p style={styles.stepBody}>
                  Deploy <strong>NaN Explosions</strong> and <strong>VRAM OOM Spikes</strong> to destabilize opponents while competing across high-stakes arenas (CERN, NASA Kepler, BCI Grids).
                </p>
              </div>
            )}
          </div>

          <div style={styles.rowBtn}>
            {introStep > 0 && (
              <button style={styles.secBtn} onClick={() => setIntroStep((prev) => prev - 1)}>
                ◄ BACK
              </button>
            )}

            {introStep < 2 ? (
              <button style={styles.primBtn} onClick={() => setIntroStep((prev) => prev + 1)}>
                NEXT CALIBRATION ►
              </button>
            ) : (
              <button
                style={{ ...styles.primBtn, backgroundColor: '#ffd700', color: '#000' }}
                onClick={() => {
                  if (!username.trim()) setUsername('Architect_Prime');
                  setScreen('HUB');
                }}
              >
                INITIALIZE DUEL MATRIX ⚡
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN HUB (COMMAND CENTER) */}
      {/* ==================================================================== */}
      {screen === 'HUB' && (
        <div style={styles.hubContainer}>
          <div style={styles.hubHeader}>
            <div>
              <h2 style={{ margin: 0, color: '#00f0ff' }}>CALLSIGN: {username.toUpperCase()}</h2>
              <span style={{ fontSize: '12px', color: '#ffd700' }}>LEVEL {playerLevel} ARCHITECT | XP: {playerXp}</span>
            </div>
            <div style={styles.badgeGold}>UNLOCKED CARDS: {unlockedIds.length}/{ALL_CARDS.length}</div>
          </div>

          <div style={styles.hubMenuGrid}>
            <div style={styles.hubCard} onClick={() => setScreen('ARENA_SELECT')}>
              <div style={styles.hubIcon}>⚔️</div>
              <h3>ENTER DUEL ARENAS ({ARENAS.length} MATRICES)</h3>
              <p>Select real-world high-stakes ML challenge matrices (CERN, NASA Exoplanet, BCI Neural Grid, Tokyo LiDAR).</p>
            </div>

            <div style={styles.hubCard} onClick={() => setScreen('DECK_BUILDER')}>
              <div style={styles.hubIcon}>🃏</div>
              <h3>DECK BUILDER & COLLECTION</h3>
              <p>Manage active duel deck. Unlock new SOTA Transformers and Sabotage Traps.</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. DECK BUILDER & CARD UNLOCK COLLECTION */}
      {/* ==================================================================== */}
      {screen === 'DECK_BUILDER' && (
        <div style={styles.builderContainer}>
          <div style={styles.builderHeader}>
            <div>
              <h2>ACTIVE DUEL DECK ({activeDeck.length}/8 CARDS)</h2>
              <p>Select cards from inventory to equip into active duel deck.</p>
            </div>
            <button style={styles.secBtn} onClick={() => setScreen('HUB')}>
              ✕ RETURN TO HUB
            </button>
          </div>

          <div style={styles.deckCardGrid}>
            {ALL_CARDS.map((card) => {
              const isUnlocked = unlockedIds.includes(card.id);
              const isEquipped = activeDeck.includes(card.id);

              return (
                <div
                  key={card.id}
                  style={{
                    ...styles.collectionCard,
                    borderColor: isEquipped ? '#ffd700' : isUnlocked ? '#00f0ff' : '#444',
                    opacity: isUnlocked ? 1 : 0.4
                  }}
                  onClick={() => isUnlocked && toggleDeckCard(card.id)}
                >
                  <div style={styles.cardTopBar}>
                    <span style={{ fontWeight: 'bold' }}>{card.name}</span>
                    <span style={styles.costBadge}>⚡{card.cost}</span>
                  </div>

                  <div style={styles.cardTypeSub}>{card.type} • SLOT: {card.slot.toUpperCase()}</div>
                  <div style={styles.cardDescText}>{card.desc}</div>

                  <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    {!isUnlocked ? (
                      <span style={{ color: '#ff0055', fontSize: '10px' }}>🔒 LOCKED (Win Duels to Unlock)</span>
                    ) : isEquipped ? (
                      <span style={{ color: '#ffd700', fontSize: '10px', fontWeight: 'bold' }}>✅ IN ACTIVE DECK</span>
                    ) : (
                      <span style={{ color: '#00f0ff', fontSize: '10px' }}>+ CLICK TO EQUIP</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. ARENA SELECTION (8 HIGH-STAKES MATRICES) */}
      {/* ==================================================================== */}
      {screen === 'ARENA_SELECT' && (
        <div style={styles.arenaSelectContainer}>
          <h2>SELECT DUEL MATRIX ARENA</h2>
          <p>Choose an arena. Each matrix enforces specific metrics, target thresholds, and domain boosts.</p>

          <div style={styles.arenaGrid}>
            {ARENAS.map((arena) => (
              <div
                key={arena.id}
                style={{ ...styles.arenaCard, backgroundColor: arena.bgTheme }}
                onClick={() => startMatch(arena)}
              >
                <h3 style={{ color: '#00f0ff', marginTop: 0, fontSize: '15px' }}>{arena.name}</h3>
                <p style={{ fontSize: '11px', color: '#c9d1d9', minHeight: '32px' }}>{arena.desc}</p>

                <div style={styles.arenaPillRow}>
                  <span style={styles.pillGold}>Target: {arena.targetScore}% {arena.metricName}</span>
                  <span style={styles.pillCyan}>Bonus: {arena.bonusType}</span>
                  <span style={styles.pillRed}>Max Turns: {arena.maxTurns}</span>
                </div>
              </div>
            ))}
          </div>

          <button style={{ ...styles.secBtn, marginTop: '20px' }} onClick={() => setScreen('HUB')}>
            ◄ BACK TO HUB
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. YU-GI-OH STYLE DUEL STAGE (ACTUAL ARCHITECTURE SLOTS) */}
      {/* ==================================================================== */}
      {screen === 'DUEL' && (
        <div style={styles.duelStage}>
          {/* Top HUD Bar */}
          <div style={styles.hudBar}>
            <div>
              <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>YOU: {username}</span>
              <div style={styles.metricText}>Score: {playerMetrics.score}% | Loss: {playerMetrics.loss} | Stability: {playerMetrics.stability}%</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ffd700', fontWeight: '900', fontSize: '16px' }}>TURN {turn} / {selectedArena.maxTurns}</div>
              <div style={{ fontSize: '10px', color: '#8b949e' }}>ARENA: {selectedArena.name}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#ff0055', fontWeight: 'bold' }}>AI OPPONENT</span>
              <div style={styles.metricText}>Score: {opponentMetrics.score}% | Loss: {opponentMetrics.loss} | Stability: {opponentMetrics.stability}%</div>
            </div>
          </div>

          {/* DUAL ARCHITECTURE PIPELINE BOARD */}
          <div style={styles.boardGrid}>
            {/* OPPONENT ARCHITECTURE SLOTS (TOP / LEFT) */}
            <div style={styles.archBoardPanel}>
              <div style={styles.archTitle}>OPPONENT NEURAL PIPELINE</div>
              <div style={styles.slotGrid}>
                {['model', 'attention', 'optimizer', 'defense'].map((slotKey) => (
                  <div key={slotKey} style={styles.pipeSlot}>
                    <div style={styles.slotLabel}>{slotKey.toUpperCase()} SLOT</div>
                    {opponentArch[slotKey] ? (
                      <div style={styles.mountedCard}>
                        <div>{opponentArch[slotKey].name}</div>
                      </div>
                    ) : (
                      <div style={styles.emptySlot}>[ EMPTY ]</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DUEL TELEMETRY LOG (CENTER) */}
            <div style={styles.telemetryPanel}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#ffd700', marginBottom: '6px' }}>DUEL TELEMETRY LOG</div>
              <div style={styles.logStack}>
                {duelLog.map((log, i) => (
                  <div key={i} style={styles.logLine}>{log}</div>
                ))}
              </div>
              <button style={styles.endTurnBtn} onClick={handleEndTurn}>
                EXECUTE EPOCH & END TURN ⌛
              </button>
            </div>

            {/* YOUR ARCHITECTURE SLOTS (BOTTOM / RIGHT) */}
            <div style={styles.archBoardPanel}>
              <div style={styles.archTitle}>YOUR NEURAL PIPELINE</div>
              <div style={styles.slotGrid}>
                {['model', 'attention', 'optimizer', 'defense'].map((slotKey) => (
                  <div key={slotKey} style={{ ...styles.pipeSlot, borderColor: '#00f0ff' }}>
                    <div style={{ ...styles.slotLabel, color: '#00f0ff' }}>{slotKey.toUpperCase()} SLOT</div>
                    {playerArch[slotKey] ? (
                      <div style={{ ...styles.mountedCard, borderColor: '#00f0ff', color: '#00f0ff' }}>
                        <div>{playerArch[slotKey].name}</div>
                      </div>
                    ) : (
                      <div style={styles.emptySlot}>[ READY TO MOUNT ]</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PLAYER 5-CARD HAND DOCK */}
          <div style={styles.handDock}>
            <div style={styles.handHeader}>
              <div>
                <span>YOUR HAND — COMPUTE ENERGY: ⚡ {computeEnergy}</span>
                <span style={{
                  marginLeft: '12px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  backgroundColor: hasPlayedCardThisTurn ? '#ff0055' : '#00f0ff',
                  color: hasPlayedCardThisTurn ? '#fff' : '#000',
                  fontWeight: 'bold'
                }}>
                  {hasPlayedCardThisTurn ? 'PLAY LIMIT REACHED (0/1 CARDS LEFT THIS TURN)' : 'CARDS PLAYABLE THIS TURN: 1/1'}
                </span>
              </div>
              <span style={{ fontSize: '10px', color: '#ffd700' }}>Hover card for ML Theory</span>
            </div>

            <div style={styles.cardsRow}>
              {playerHand.map((card) => {
                const isPlayable = !hasPlayedCardThisTurn && computeEnergy >= card.cost;
                return (
                  <div
                    key={card.instanceId}
                    style={{
                      ...styles.duelCard,
                      borderColor: card.type === 'SABOTAGE' ? '#ff0055' : '#00f0ff',
                      opacity: isPlayable ? 1 : 0.4,
                      cursor: isPlayable ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => handlePlayCard(card)}
                    onMouseEnter={() => setInspectCard(card)}
                  >
                    <div style={styles.cardHeader}>
                      <span style={{ fontWeight: 'bold' }}>{card.name}</span>
                      <span style={styles.costBadge}>⚡{card.cost}</span>
                    </div>
                    <div style={styles.cardCategory}>{card.type}</div>
                    <div style={styles.cardBodyDesc}>{card.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EDUCATIONAL INSPECTION DRAWER */}
          {inspectCard && (
            <div style={styles.eduDrawer}>
              <div style={{ fontWeight: 'bold', color: '#ffd700', marginBottom: '2px' }}>
                🎓 ML THEORY: {inspectCard.name.toUpperCase()}
              </div>
              <div style={{ color: '#c9d1d9', fontSize: '11px', lineHeight: '1.3' }}>{inspectCard.eduInfo}</div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. VICTORY & REWARDS */}
      {/* ==================================================================== */}
      {screen === 'VICTORY' && (
        <div style={styles.introCard}>
          <div style={styles.cyberHeader}>DUEL CONCLUDED</div>
          <h1 style={{ ...styles.titleGlow, color: playerMetrics.score >= selectedArena.targetScore ? '#00f0ff' : '#ff0055' }}>
            {playerMetrics.score >= selectedArena.targetScore ? 'BENCHMARK SURPASSED! VICTORY!' : 'PIPELINE COLLAPSED! DEFEAT!'}
          </h1>

          <p style={{ color: '#c9d1d9', fontSize: '14px' }}>
            Your Final Score: <strong>{playerMetrics.score}%</strong> (Target: {selectedArena.targetScore}%)
          </p>

          <button style={styles.primBtn} onClick={() => setScreen('HUB')}>
            RETURN TO COMMAND HUB 🔄
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CYBERPUNK / YU-GI-OH DUEL MATRIX STYLING
// ============================================================================
const styles = {
  appContainer: {
    backgroundColor: '#06080e',
    color: '#e6edf3',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, monospace',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    boxSizing: 'border-box'
  },
  introCard: {
    backgroundColor: '#0d1117',
    border: '2px solid #00f0ff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)'
  },
  cyberHeader: {
    fontSize: '10px',
    color: '#00f0ff',
    letterSpacing: '2px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  titleGlow: {
    fontSize: '28px',
    margin: '0 0 6px 0',
    color: '#ffffff'
  },
  introSub: {
    color: '#8b949e',
    fontSize: '12px',
    marginBottom: '20px'
  },
  tutorialBox: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'left',
    marginBottom: '20px'
  },
  stepTitle: {
    color: '#ffd700',
    fontSize: '13px',
    marginTop: 0
  },
  stepBody: {
    fontSize: '12px',
    color: '#c9d1d9',
    lineHeight: '1.4'
  },
  textInput: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0d1117',
    border: '1px solid #00f0ff',
    color: '#fff',
    borderRadius: '4px',
    fontFamily: 'monospace',
    marginTop: '8px',
    boxSizing: 'border-box'
  },
  rowBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px'
  },
  primBtn: {
    backgroundColor: '#00f0ff',
    color: '#06080e',
    border: 'none',
    padding: '12px 20px',
    fontWeight: '900',
    borderRadius: '6px',
    cursor: 'pointer',
    flex: 1
  },
  secBtn: {
    backgroundColor: '#21262d',
    color: '#c9d1d9',
    border: '1px solid #30363d',
    padding: '10px 16px',
    fontWeight: 'bold',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  hubContainer: {
    maxWidth: '800px',
    width: '100%'
  },
  hubHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  badgeGold: {
    backgroundColor:'#ffd700',
    color: '#000',
    padding: '4px 8px',
    fontWeight: 'bold',
    fontSize: '11px',
    borderRadius: '4px'
  },
  hubMenuGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  hubCard: {
    backgroundColor: '#0d1117',
    border: '2px solid #2a2e3d',
    borderRadius: '8px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  hubIcon: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  builderContainer: {
    maxWidth: '1000px',
    width: '100%'
  },
  builderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  deckCardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px'
  },
  collectionCard: {
    backgroundColor: '#0d1117',
    border: '2px solid #30363d',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '130px'
  },
  cardTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px'
  },
  costBadge: {
    backgroundColor: '#00f0ff',
    color: '#000',
    fontWeight: 'bold',
    padding: '1px 5px',
    borderRadius: '3px',
    fontSize: '10px'
  },
  cardTypeSub: {
    fontSize: '9px',
    color: '#8b949e',
    margin: '4px 0'
  },
  cardDescText: {
    fontSize: '10px',
    color: '#c9d1d9'
  },
  arenaSelectContainer: {
    maxWidth: '950px',
    width: '100%'
  },
  arenaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginTop: '16px'
  },
  arenaCard: {
    border: '2px solid #30363d',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer'
  },
  arenaPillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '10px'
  },
  pillGold: {
    backgroundColor: '#ffd700',
    color: '#000',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '3px'
  },
  pillCyan: {
    backgroundColor: '#00f0ff',
    color: '#000',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '3px'
  },
  pillRed: {
    backgroundColor: '#ff0055',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '3px'
  },
  duelStage: {
    maxWidth: '1100px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  hudBar: {
    display: 'grid',
    gridTemplateColumns: '1fr 200px 1fr',
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    padding: '10px 16px',
    borderRadius: '6px',
    alignItems: 'center'
  },
  metricText: {
    fontSize: '10px',
    color: '#c9d1d9',
    marginTop: '2px'
  },
  boardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 240px 1fr',
    gap: '10px',
    minHeight: '280px'
  },
  archBoardPanel: {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '10px'
  },
  archTitle: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#8b949e',
    marginBottom: '8px'
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  pipeSlot: {
    backgroundColor: '#161b22',
    border: '1px dashed #ff0055',
    borderRadius: '4px',
    padding: '8px',
    minHeight: '80px'
  },
  slotLabel: {
    fontSize: '8px',
    color: '#ff0055',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  mountedCard: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#ff0055'
  },
  emptySlot: {
    fontSize: '9px',
    color: '#444'
  },
  telemetryPanel: {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column'
  },
  logStack: {
    flex: 1,
    fontSize: '9px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto'
  },
  logLine: {
    backgroundColor: '#161b22',
    padding: '4px 6px',
    borderRadius: '3px',
    borderLeft: '2px solid #ffd700'
  },
  endTurnBtn: {
    backgroundColor: '#ffd700',
    color: '#000',
    border: 'none',
    padding: '8px',
    fontWeight: 'bold',
    fontSize: '10px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginTop: '6px'
  },
  handDock: {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '10px'
  },
  handHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px'
  },
  duelCard: {
    backgroundColor: '#161b22',
    border: '2px solid #00f0ff',
    borderRadius: '4px',
    padding: '8px',
    minHeight: '90px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px'
  },
  cardCategory: {
    fontSize: '8px',
    color: '#8b949e',
    margin: '2px 0'
  },
  cardBodyDesc: {
    fontSize: '8px',
    color: '#c9d1d9'
  },
  eduDrawer: {
    backgroundColor: '#161b22',
    border: '1px solid #ffd700',
    borderRadius: '4px',
    padding: '8px 12px'
  }
};