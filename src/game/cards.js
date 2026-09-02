// Every card teaches one real machine-learning idea.
// `desc` is the in-game flavour; `eduInfo` is the plain-English explanation
// shown in the Learn panel, written for a curious high-school reader.

export const ALL_CARDS = [
  // --- BACKBONES: the main body of the model ---
  {
    id: 'c_llama3_moe',
    name: 'Mixture-of-Experts Backbone',
    shortName: 'MoE Backbone',
    icon: '🧠',
    type: 'BACKBONE',
    slot: 'model',
    cost: 3,
    stats: { accBoost: 32, lossReduce: 0.8, latencyMs: 65, vramGb: 8 },
    desc: 'A huge model that only switches on the parts it actually needs.',
    eduInfo:
      'Instead of one giant network doing everything, a Mixture-of-Experts keeps many smaller "expert" networks and a router that picks the best one or two for each input. The model can hold enormous knowledge while only running a small slice of itself each time — like calling one specialist instead of asking the whole hospital.',
    unlockedDefault: true
  },
  {
    id: 'c_vit_huge',
    name: 'Vision Transformer (ViT)',
    shortName: 'Vision Transformer',
    icon: '👁️',
    type: 'BACKBONE',
    slot: 'model',
    cost: 3,
    stats: { accBoost: 28, lossReduce: 0.65, latencyMs: 40, vramGb: 6 },
    desc: 'Reads pictures the way language models read sentences.',
    eduInfo:
      'A Vision Transformer cuts an image into small square patches, like puzzle pieces, turns each patch into a list of numbers, and tags it with where it came from. Then it uses the same Transformer machinery that powers chatbots to work out how the pieces relate to each other.',
    unlockedDefault: true
  },
  {
    id: 'c_mamba2',
    name: 'Mamba State Space Model',
    shortName: 'Mamba SSM',
    icon: '🐍',
    type: 'BACKBONE',
    slot: 'model',
    cost: 2,
    stats: { accBoost: 24, lossReduce: 0.55, latencyMs: 12, vramGb: 3 },
    desc: 'Stays fast even on very long inputs.',
    eduInfo:
      'Normal Transformers compare every token to every other token, so doubling the input length makes the work roughly four times bigger. Mamba instead keeps a running memory summary that it updates as it reads, so the work grows in a straight line with length — much cheaper for long documents, audio or DNA.',
    unlockedDefault: false
  },
  {
    id: 'c_convnext',
    name: 'ConvNeXt Network',
    shortName: 'ConvNeXt',
    icon: '🔲',
    type: 'BACKBONE',
    slot: 'model',
    cost: 2,
    stats: { accBoost: 26, lossReduce: 0.6, latencyMs: 22, vramGb: 4 },
    desc: 'Classic pattern-spotting convolutions, modernised.',
    eduInfo:
      'Convolutional networks slide small filters across an image to spot edges, textures and shapes. ConvNeXt keeps that proven idea but borrows design tricks from Transformers, making it competitive with newer architectures while staying fast and memory-friendly.',
    unlockedDefault: false
  },

  // --- ATTENTION: how the model connects information ---
  {
    id: 'c_flash_attn3',
    name: 'FlashAttention',
    shortName: 'FlashAttention',
    icon: '⚡',
    type: 'ATTENTION',
    slot: 'attention',
    cost: 2,
    stats: { accBoost: 14, lossReduce: 0.25, latencyMs: -35, vramGb: -2 },
    desc: 'Identical maths, far less waiting.',
    eduInfo:
      'Attention normally shuffles data back and forth between the GPU\'s big-but-slow memory and its small-but-fast on-chip cache. FlashAttention reorders the calculation so the data stays in the fast cache. The answer is exactly the same — it just arrives much sooner and uses less memory.',
    unlockedDefault: true
  },
  {
    id: 'c_rope_embed',
    name: 'Rotary Position Embeddings',
    shortName: 'RoPE',
    icon: '🧭',
    type: 'ATTENTION',
    slot: 'attention',
    cost: 1,
    stats: { accBoost: 10, lossReduce: 0.2, latencyMs: 5, vramGb: 0 },
    desc: 'Teaches the model what word order means.',
    eduInfo:
      'A Transformer sees a bag of tokens with no built-in sense of order, yet "dog bites man" and "man bites dog" mean different things. RoPE rotates each token\'s vector by an amount based on its position, so the model can feel how far apart two tokens are without memorising a table of positions.',
    unlockedDefault: true
  },
  {
    id: 'c_swiglu',
    name: 'SwiGLU Activation',
    shortName: 'SwiGLU',
    icon: '🚪',
    type: 'ATTENTION',
    slot: 'attention',
    cost: 1,
    stats: { accBoost: 8, lossReduce: 0.18, latencyMs: 2, vramGb: 1 },
    desc: 'A smarter gate for information flowing through a layer.',
    eduInfo:
      'Activation functions decide how much signal passes through each layer — without them a deep network would collapse into one big linear equation. SwiGLU uses a smooth gate that lets the network control its own information flow, and in practice it reaches better accuracy than older choices like ReLU.',
    unlockedDefault: false
  },

  // --- OPTIMIZERS: how the model learns from mistakes ---
  {
    id: 'c_adamw_decay',
    name: 'AdamW + Cosine Warmup',
    shortName: 'AdamW',
    icon: '📉',
    type: 'OPTIMIZER',
    slot: 'optimizer',
    cost: 1,
    stats: { accBoost: 12, lossReduce: 0.3, latencyMs: 0, vramGb: 1 },
    desc: 'The reliable default for training almost anything.',
    eduInfo:
      'An optimizer decides how to nudge the model\'s weights after each mistake. AdamW averages recent gradients so learning stays steady, and separately shrinks weights a little each step to discourage memorising the training data. Starting slow (warmup) and easing off at the end (cosine decay) keeps the whole run smooth.',
    unlockedDefault: true
  },
  {
    id: 'c_lion_opt',
    name: 'Lion Optimizer',
    shortName: 'Lion',
    icon: '🦁',
    type: 'OPTIMIZER',
    slot: 'optimizer',
    cost: 1,
    stats: { accBoost: 15, lossReduce: 0.35, latencyMs: -5, vramGb: -1 },
    desc: 'An optimizer that a computer discovered, not a human.',
    eduInfo:
      'Lion was found by an automated search through millions of candidate training rules. It is simpler than AdamW: it tracks only momentum and moves every weight by the same small step in whichever direction has been working. It trains fast and needs less memory.',
    unlockedDefault: false
  },

  // --- DEFENCE: keeping training stable ---
  {
    id: 'c_grad_clip',
    name: 'Gradient Clipping',
    shortName: 'Grad Clipping',
    icon: '🛡️',
    type: 'DEFENSE',
    slot: 'defense',
    cost: 1,
    stats: { stabilityBoost: 40, lossReduce: 0.1, latencyMs: 1, vramGb: 0 },
    desc: 'A speed limit on how much the model can change at once.',
    eduInfo:
      'Occasionally a training step produces a wildly large gradient that can wreck the model in a single update. Gradient clipping caps how big any one update is allowed to be, so training survives the rough patches instead of exploding.',
    unlockedDefault: true
  },
  {
    id: 'c_spectral_norm',
    name: 'Spectral Normalization',
    shortName: 'Spectral Norm',
    icon: '🧊',
    type: 'DEFENSE',
    slot: 'defense',
    cost: 1,
    stats: { stabilityBoost: 30, lossReduce: 0.15, latencyMs: 3, vramGb: 0 },
    desc: 'Stops any layer from amplifying its input too hard.',
    eduInfo:
      'Each layer stretches the data passing through it by some amount. If layers stretch too aggressively, small input changes get magnified into wild output swings. Spectral normalization caps that stretch factor, making the network calmer and much harder to fool with tiny adversarial nudges.',
    unlockedDefault: false
  },

  // --- SABOTAGE: real failure modes, aimed at your opponent ---
  {
    id: 'c_atk_nan_explosion',
    name: 'Exploding Gradients',
    shortName: 'NaN Blowup',
    icon: '💥',
    type: 'SABOTAGE',
    slot: 'target',
    cost: 2,
    stats: { targetStability: -45, targetLossSpike: 0.85 },
    desc: 'Their numbers overflow and training collapses.',
    eduInfo:
      'When gradients grow step after step, the numbers can exceed what the computer can represent and turn into NaN — "Not a Number". Once NaN appears it spreads through every weight, and training is dead until someone restarts it. This is exactly what gradient clipping defends against.',
    unlockedDefault: true
  },
  {
    id: 'c_atk_vram_oom',
    name: 'Out of GPU Memory',
    shortName: 'OOM Crash',
    icon: '🔥',
    type: 'SABOTAGE',
    slot: 'target',
    cost: 2,
    stats: { targetLatencyMs: 60, targetStability: -25 },
    desc: 'Their GPU runs out of room mid-training.',
    eduInfo:
      'A GPU only has so much fast memory, and training must store intermediate results for every layer in order to compute gradients. Push the batch size or sequence length too far and the run dies with an Out Of Memory error — probably the single most common error in practical deep learning.',
    unlockedDefault: false
  },
  {
    id: 'c_atk_covariate',
    name: 'Distribution Shift',
    shortName: 'Data Shift',
    icon: '🌪️',
    type: 'SABOTAGE',
    slot: 'target',
    cost: 3,
    stats: { targetAcc: -22, targetLossSpike: 0.6 },
    desc: 'The real world stops matching their training data.',
    eduInfo:
      'A model only knows the world it was trained on. When live data drifts away from that — a self-driving car trained in sunshine meeting its first blizzard — the patterns it learned stop holding, and accuracy falls off a cliff even though the model itself never changed.',
    unlockedDefault: false
  }
];

export const CARD_TYPE_INFO = {
  BACKBONE: { label: 'Backbone', blurb: 'The main body of your model', color: 'violet' },
  ATTENTION: { label: 'Attention', blurb: 'How information connects', color: 'cyan' },
  OPTIMIZER: { label: 'Optimizer', blurb: 'How your model learns', color: 'green' },
  DEFENSE: { label: 'Defence', blurb: 'Keeps training stable', color: 'blue' },
  SABOTAGE: { label: 'Sabotage', blurb: 'A real failure, aimed at your rival', color: 'red' }
};

export const SLOT_INFO = {
  model: { label: 'Backbone', hint: 'The core network', icon: '🧠' },
  attention: { label: 'Attention', hint: 'Connects information', icon: '⚡' },
  optimizer: { label: 'Optimizer', hint: 'Learns from mistakes', icon: '📉' },
  defense: { label: 'Defence', hint: 'Keeps things stable', icon: '🛡️' }
};

export const SLOT_ORDER = ['model', 'attention', 'optimizer', 'defense'];

export const DEFAULT_DECK = ALL_CARDS.filter((c) => c.unlockedDefault).map((c) => c.id);

export const getCard = (id) => ALL_CARDS.find((c) => c.id === id);
