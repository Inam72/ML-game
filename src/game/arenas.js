// Each arena is a real place machine learning gets used, with the metric
// that field actually cares about.

export const ARENAS = [
  {
    id: 'arena_cern',
    name: 'CERN Particle Collider',
    icon: '⚛️',
    metricName: 'Signal Detection',
    targetScore: 94.5,
    maxTurns: 8,
    bonusType: 'BACKBONE',
    desc: 'Sift petabytes of collision data for the handful of events that matter.',
    why: 'Detectors record millions of collisions per second. Almost all are noise, so models must find the rare interesting ones.',
    difficulty: 'Medium',
    theme: 'cern'
  },
  {
    id: 'arena_tokyo',
    name: 'Tokyo Self-Driving Grid',
    icon: '🚗',
    metricName: 'Object Segmentation',
    targetScore: 88.0,
    maxTurns: 8,
    bonusType: 'ATTENTION',
    desc: 'Label every pedestrian, cyclist and car in a 3D laser scan — in milliseconds.',
    why: 'Self-driving cars fuse camera and LiDAR data. A late answer is as dangerous as a wrong one.',
    difficulty: 'Easy',
    theme: 'tokyo'
  },
  {
    id: 'arena_wallstreet',
    name: 'Wall Street Trading Floor',
    icon: '📈',
    metricName: 'Price Prediction',
    targetScore: 91.0,
    maxTurns: 6,
    bonusType: 'OPTIMIZER',
    desc: 'Predict where prices move next in an extremely noisy market.',
    why: 'Financial data is mostly randomness. Squeezing out a small real signal without overfitting is the whole challenge.',
    difficulty: 'Hard',
    theme: 'market'
  },
  {
    id: 'arena_bioneura',
    name: 'Hospital Cancer Screening',
    icon: '🩺',
    metricName: 'Tumour Detection',
    targetScore: 96.0,
    maxTurns: 10,
    bonusType: 'DEFENSE',
    desc: 'Spot tumours in 3D medical scans, where a miss costs a life.',
    why: 'In medicine a false negative is far worse than a false alarm, so these models are tuned for very high recall.',
    difficulty: 'Hard',
    theme: 'medical'
  },
  {
    id: 'arena_nasa_exoplanet',
    name: 'NASA Planet Hunt',
    icon: '🪐',
    metricName: 'Transit Detection',
    targetScore: 95.0,
    maxTurns: 8,
    bonusType: 'BACKBONE',
    desc: 'Find the faint dip in starlight that means a planet just passed by.',
    why: 'A planet blocks a fraction of a percent of its star. The signal is buried under instrument noise.',
    difficulty: 'Medium',
    theme: 'space'
  },
  {
    id: 'arena_typhoon_net',
    name: 'Pacific Storm Forecast',
    icon: '🌀',
    metricName: 'Track Accuracy',
    targetScore: 92.5,
    maxTurns: 7,
    bonusType: 'ATTENTION',
    desc: 'Predict where a typhoon goes next from satellite and sensor data.',
    why: 'Weather models like GraphCast now beat traditional physics simulations on some forecasts — and run in seconds.',
    difficulty: 'Medium',
    theme: 'storm'
  },
  {
    id: 'arena_subsea_drone',
    name: 'Deep Sea Explorer Drone',
    icon: '🌊',
    metricName: 'Sonar Mapping',
    targetScore: 89.5,
    maxTurns: 6,
    bonusType: 'DEFENSE',
    desc: 'Map the ocean floor by sound alone, with no GPS and heavy echo noise.',
    why: 'Radio waves die in water, so robots navigate by sonar. The model has to stay reliable when its input is messy.',
    difficulty: 'Easy',
    theme: 'ocean'
  },
  {
    id: 'arena_bci_neural',
    name: 'Brain–Computer Interface',
    icon: '🧬',
    metricName: 'Signal Decoding',
    targetScore: 97.2,
    maxTurns: 9,
    bonusType: 'OPTIMIZER',
    desc: 'Turn live neuron activity into movement for a robotic arm.',
    why: 'Implants read thousands of neurons at once. Decoding intent in real time is what lets paralysed patients move a cursor or a limb.',
    difficulty: 'Hard',
    theme: 'neuro'
  }
];

export const getArena = (id) => ARENAS.find((a) => a.id === id);
