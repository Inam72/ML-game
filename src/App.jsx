import React, { useState, useEffect, useRef } from 'react';

// --- STYLES & RETRO CYBER UI SYSTEM ---
const styles = {
  app: { minHeight: '100vh', backgroundColor: '#090d16', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '40px' },
  header: { backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  logo: { color: '#38bdf8', fontWeight: '900', fontSize: '20px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' },
  
  // Containers & Layout
  container: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
  card: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' },
  
  // Grids
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },

  // Buttons
  btnPrimary: { backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' },
  btnSuccess: { backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  btnOutline: { backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' },

  // Node Pipeline Slots
  pipelineFlow: { display: 'flex', gap: '10px', overflowX: 'auto', padding: '14px 0', alignItems: 'center' },
  pipelineSlot: { minWidth: '135px', height: '115px', border: '2px dashed #334155', borderRadius: '10px', backgroundColor: '#1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', position: 'relative', padding: '8px' },
  activeSlot: { border: '2px solid #38bdf8', backgroundColor: '#0f172a' },
  
  // Terminal
  terminal: { backgroundColor: '#020617', color: '#38bdf8', fontFamily: '"Fira Code", monospace', fontSize: '12px', borderRadius: '10px', padding: '16px', height: '260px', overflowY: 'auto', border: '1px solid #1e293b' },
  
  // Modals
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }
};

// --- NEWBIE-FRIENDLY CARDS DATABASE (With Plain English Explanations) ---
const CARDS_DATABASE = {
  dataset: [
    { id: 'ds_mnist', name: 'MNIST Digits', plain: '📚 Simple textbook for basic learning', cost: 5, mem: 1, acc: 15, fairness: 90 },
    { id: 'ds_cifar', name: 'CIFAR-10 Objects', plain: '🖼️ Everyday pictures (cars, animals)', cost: 15, mem: 4, acc: 25, fairness: 85 },
    { id: 'ds_ct', name: 'Medical Scans', plain: '🩻 Detailed 3D X-Ray & CT images', cost: 40, mem: 12, acc: 40, fairness: 75 },
    { id: 'ds_sat', name: 'Satellite Data', plain: '📡 Complex high-res space photos', cost: 60, mem: 18, acc: 55, fairness: 95 }
  ],
  architecture: [
    { id: 'arch_mlp', name: 'Simple Neural Net', plain: '🧠 Basic brain with simple connections', cost: 10, mem: 2, acc: 15 },
    { id: 'arch_resnet', name: 'Vision Net (ResNet)', plain: '👁️ Specialized in recognizing shapes', cost: 35, mem: 8, acc: 35 },
    { id: 'arch_unet', name: 'Medical Segmenter', plain: '🩺 Outlines specific boundaries in scans', cost: 50, mem: 12, acc: 45 },
    { id: 'arch_tf', name: 'Transformer Engine', plain: '⚡ Supercharged AI brain (ChatGPT style)', cost: 90, mem: 24, acc: 65 }
  ],
  layers: [
    { id: 'lay_relu', name: 'Standard Layer', plain: '🔹 Standard signal filter', cost: 5, mem: 1, acc: 10 },
    { id: 'lay_gelu', name: 'Smooth Activation', plain: '🔹 Advanced smooth filter for deep logic', cost: 10, mem: 2, acc: 15 },
    { id: 'lay_attn', name: 'Self-Attention', plain: '🔍 Helps AI focus on important details', cost: 25, mem: 6, acc: 25 }
  ],
  optimizer: [
    { id: 'opt_sgd', name: 'Standard Tutor (SGD)', plain: '🎯 Slow & steady learning process', cost: 5, mem: 0, acc: 10 },
    { id: 'opt_adamw', name: 'Smart Tutor (AdamW)', plain: '🚀 Fast learning with smart adjustments', cost: 20, mem: 1, acc: 25 }
  ],
  scheduler: [
    { id: 'sch_step', name: 'Paced Schedule', plain: '⏱️ Slows down learning rate over time', cost: 5, mem: 0, acc: 5 },
    { id: 'sch_cosine', name: 'Smooth Schedule', plain: '🌊 Smoothly adjusts learning speed', cost: 15, mem: 0, acc: 15 }
  ],
  regularization: [
    { id: 'reg_drop', name: 'Dropout (Anti-Cheat)', plain: '🛡️ Prevents model from memorizing answers', cost: 5, mem: 0, acc: 10 },
    { id: 'reg_aug', name: 'Data Shuffler', plain: '🎨 Flips & twists pictures for practice', cost: 15, mem: 2, acc: 18 }
  ],
  hardware: [
    { id: 'hw_cpu', name: 'Basic CPU Engine', plain: '💻 Good for simple tasks (4GB Limit)', cost: 5, vram: 4, compute: 1, carbon: 10 },
    { id: 'hw_rtx4090', name: 'Pro Gaming GPU', plain: '🎮 Powerful hardware (24GB Limit)', cost: 45, vram: 24, compute: 5, carbon: 45 },
    { id: 'hw_h100', name: 'AI Server Rig', plain: '🏢 Enterprise Monster (80GB Limit)', cost: 120, vram: 80, compute: 12, carbon: 120 }
  ]
};

// --- CAMPAIGN ERAS WITH HINTS ---
const CAMPAIGN_ERAS = [
  { id: 1, era: '1. Perceptron Era', title: 'OCR Handwritten Digits', targetAcc: 65, budget: 50, hint: '💡 Tip: Keep it light! Simple Net + Basic CPU will pass easily.' },
  { id: 2, era: '2. Vision Era', title: 'Car & Animal Classifier', targetAcc: 75, budget: 110, hint: '💡 Tip: Equip Vision Net (ResNet) and upgrade your Hardware!' },
  { id: 3, era: '3. Medical Era', title: 'Pneumonia Detector', targetAcc: 80, budget: 180, hint: '💡 Tip: Add "Data Shuffler" regularization so it doesn’t overfit!' },
  { id: 4, era: '4. AI Breakthrough', title: 'Generative Satellite Model', targetAcc: 88, budget: 280, hint: '💡 Tip: Requires Transformer Engine & Pro GPU to run.' }
];

const DEPLOYMENT_TARGETS = [
  { id: 'mobile', name: '📱 Smartphone App', maxMem: 4, maxLatency: 40, desc: 'Needs tiny memory footprint!' },
  { id: 'cloud', name: '☁️ Cloud Server', maxMem: 80, maxLatency: 200, desc: 'Lots of memory, can handle big models.' },
  { id: 'edge', name: '🚁 Drone Camera', maxMem: 8, maxLatency: 15, desc: 'Needs super fast response time!' }
];

export default function AIArchitect() {
  const [viewState, setViewState] = useState('LOGIN'); // LOGIN, TUTORIAL, HUB, WORKSPACE, SIMULATION, EVALUATION
  const [userProfile, setUserProfile] = useState({ username: '', researchPoints: 50, currentEra: 1 });

  // Game Pipeline Engine
  const [selectedEra, setSelectedEra] = useState(CAMPAIGN_ERAS[0]);
  const [pipeline, setPipeline] = useState({});
  const [drawerSlot, setDrawerSlot] = useState(null);
  const [appliedUpgrades, setAppliedUpgrades] = useState({ quantization: false, lora: false });

  // Simulation & Logs State
  const [epoch, setEpoch] = useState(0);
  const [simMetrics, setSimMetrics] = useState({ acc: 0, loss: 3.5, vramUsed: 0, latency: 0, carbon: 0, fairness: 85 });
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedDeployment, setSelectedDeployment] = useState(DEPLOYMENT_TARGETS[0]);
  const [finalScoreCard, setFinalScoreCard] = useState(null);

  const terminalEndRef = useRef(null);

  // Computations
  const totalBudgetSpent = Object.values(pipeline).reduce((acc, card) => acc + (card?.cost || 0), 0);
  const totalRawMem = Object.values(pipeline).reduce((acc, card) => acc + (card?.mem || 0), 0);
  const activeHW = pipeline.hardware;
  const maxVRAM = activeHW ? activeHW.vram : 0;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const addLog = (msg, type = 'info') => {
    const prefix = type === 'error' ? '❌ [PROBLEM]' : type === 'warn' ? '⚠️ [WARNING]' : type === 'success' ? '✅ [SUCCESS]' : 'ℹ️ [INFO]';
    setTerminalLogs(prev => [...prev, `${prefix} ${msg}`]);
  };

  const equipCard = (slot, card) => {
    setPipeline(prev => ({ ...prev, [slot]: card }));
    setDrawerSlot(null);
  };

  const removeCard = (slot) => {
    setPipeline(prev => {
      const copy = { ...prev };
      delete copy[slot];
      return copy;
    });
  };

  const startSimulation = () => {
    if (!pipeline.dataset || !pipeline.architecture || !pipeline.hardware) {
      alert('⚠️ Newbie Check: You need at least a Dataset, an Architecture, and Hardware to build an AI!');
      return;
    }
    setViewState('SIMULATION');
    setEpoch(0);
    setTerminalLogs([]);
    addLog(`Starting AI Training for ${selectedEra.title}...`);
  };

  // Simulation Execution Engine
  useEffect(() => {
    if (viewState !== 'SIMULATION') return;

    if (epoch < 10) {
      const timer = setTimeout(() => {
        const currentEpoch = epoch + 1;
        setEpoch(currentEpoch);

        const qMult = appliedUpgrades.quantization ? 0.5 : 1.0;
        const currentVRAM = Math.round(totalRawMem * qMult * 10) / 10;

        // NEWBIE-FRIENDLY OOM CHECK
        if (currentVRAM > maxVRAM) {
          addLog(`MEMORY OVERLOAD: Your components need ${currentVRAM}GB memory, but your ${activeHW?.name} only has ${maxVRAM}GB!`, 'error');
          setActiveChallenge({
            title: '⚠️ Memory Overload (Out of RAM)',
            desc: 'Your engine is full! How would you like to solve this?',
            options: [
              { 
                label: 'Compress Model (Quantization)', 
                action: () => { 
                  setAppliedUpgrades(p => ({ ...p, quantization: true })); 
                  setActiveChallenge(null); 
                  addLog('Squeezed model size in half using Quantization!', 'success'); 
                } 
              },
              { 
                label: 'Remove Optional Extra Layers', 
                action: () => { 
                  removeCard('layers'); 
                  setActiveChallenge(null); 
                  addLog('Removed extra layer to save space.', 'warn'); 
                } 
              }
            ]
          });
          return;
        }

        // Mid-Simulation Challenge Trigger
        if (currentEpoch === 5 && !activeChallenge && Math.random() > 0.3) {
          setActiveChallenge({
            title: '⚠️ AI Memorizing Answers (Overfitting)',
            desc: 'The model is just memorizing practice tests rather than actually learning concepts.',
            options: [
              { 
                label: 'Add Data Shuffler (RandAugment)', 
                action: () => { 
                  equipCard('regularization', CARDS_DATABASE.regularization[1]); 
                  setActiveChallenge(null); 
                  addLog('Added Data Shuffler! The AI is forced to learn real patterns.', 'success'); 
                } 
              },
              { 
                label: 'Keep Going Anyway', 
                action: () => { 
                  setActiveChallenge(null); 
                  addLog('Continued training without fixing memorization.', 'warn'); 
                } 
              }
            ]
          });
          return;
        }

        const baseAcc = Object.values(pipeline).reduce((s, c) => s + (c?.acc || 0), 0);
        const loraBonus = appliedUpgrades.lora ? 8 : 0;
        const computedAcc = Math.min(99, Math.floor(((baseAcc + loraBonus) * currentEpoch) / 10));
        const computedLoss = Math.max(0.01, parseFloat((3.5 - (computedAcc / 28)).toFixed(2)));
        const latency = Math.max(8, 120 - (activeHW?.compute || 1) * 8);

        setSimMetrics({
          acc: computedAcc,
          loss: computedLoss,
          vramUsed: currentVRAM,
          latency,
          carbon: (activeHW?.carbon || 10) * currentEpoch,
          fairness: pipeline.dataset?.fairness || 80
        });

        addLog(`Step ${currentEpoch}/10 ➔ Accuracy: ${computedAcc}% | Error Rate: ${computedLoss}`);

      }, 700);
      return () => clearTimeout(timer);
    } else {
      addLog('Training Complete! Preparing Simple Results Board...', 'success');
      setTimeout(() => setViewState('EVALUATION'), 1000);
    }
  }, [viewState, epoch, activeChallenge, totalRawMem, maxVRAM, pipeline, appliedUpgrades, activeHW]);

  const calculateFinalScore = () => {
    const accPoints = Math.round((simMetrics.acc / 100) * 40);
    const computePoints = totalBudgetSpent <= selectedEra.budget ? 20 : 5;
    const passesMem = simMetrics.vramUsed <= selectedDeployment.maxMem;
    const passesLatency = simMetrics.latency <= selectedDeployment.maxLatency;
    const deployPoints = (passesMem && passesLatency) ? 20 : 0;

    const total = accPoints + computePoints + deployPoints + 20;

    const scoreResult = {
      total,
      accPoints,
      computePoints,
      deployPoints,
      passed: simMetrics.acc >= selectedEra.targetAcc && passesMem && passesLatency
    };

    setFinalScoreCard(scoreResult);
    if (scoreResult.passed && selectedEra.id === userProfile.currentEra && userProfile.currentEra < 4) {
      setUserProfile(p => ({ ...p, currentEra: p.currentEra + 1 }));
    }
  };

  // RENDER VIEWS

  // VIEW 1: LOGIN
  if (viewState === 'LOGIN') {
    return (
      <div style={styles.app}>
        <div style={{ maxWidth: '440px', margin: '80px auto', padding: '0 20px' }}>
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>🤖</div>
            <h1 style={{ color: '#38bdf8', fontSize: '24px', fontWeight: 'bold' }}>AI ARCHITECT</h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>
              The Beginner-Friendly Machine Learning Strategy Game
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setUserProfile(p => ({ ...p, username: e.target.username.value })); setViewState('TUTORIAL'); }}>
              <input 
                name="username"
                type="text" 
                placeholder="Enter Your Name / Engineer Handle..." 
                required 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#020617', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }}
              />
              <button type="submit" style={{ ...styles.btnPrimary, width: '100%', padding: '12px' }}>
                Start Playing &gt;
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: 30-SECOND NEWBIE TUTORIAL
  if (viewState === 'TUTORIAL') {
    return (
      <div style={styles.app}>
        <div style={{ maxWidth: '650px', margin: '60px auto', padding: '0 20px' }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#38bdf8', fontSize: '18px', margin: 0 }}>💡 How AI Works (In 30 Seconds)</h2>
              <button style={styles.btnOutline} onClick={() => setViewState('HUB')}>Skip Intro ⏩</button>
            </div>
            
            <div style={styles.grid2}>
              <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>1. Dataset = The Textbook</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>This is the info your AI reads to learn patterns.</p>
              </div>
              <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>2. Architecture = The Brain</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>The structural design used to process information.</p>
              </div>
              <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>3. Hardware = The Engine</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>GPUs power the brain. Powerful brains need bigger GPUs!</p>
              </div>
              <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>4. Your Goal</h4>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Get high accuracy without spending too much money!</p>
              </div>
            </div>

            <button style={{ ...styles.btnSuccess, width: '100%', marginTop: '20px' }} onClick={() => setViewState('HUB')}>
              Got It! Go to Missions &gt;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>🤖 AI ARCHITECT</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
          <div>Player: <strong style={{ color: '#38bdf8' }}>{userProfile.username}</strong></div>
          <div>Level: <strong style={{ color: '#22c55e' }}>{userProfile.currentEra} / 4</strong></div>
          {viewState !== 'HUB' && <button style={styles.btnOutline} onClick={() => setViewState('HUB')}>Choose Mission</button>}
        </div>
      </header>

      {/* VIEW 3: CAMPAIGN MISSIONS */}
      {viewState === 'HUB' && (
        <div style={styles.container}>
          <h2 style={{ fontSize: '20px', color: '#f8fafc', marginBottom: '6px' }}>Select a Mission</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Complete missions to unlock advanced AI hardware!</p>

          <div style={styles.grid2}>
            {CAMPAIGN_ERAS.map(m => {
              const isLocked = m.id > userProfile.currentEra;
              return (
                <div key={m.id} style={{ ...styles.card, opacity: isLocked ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>{m.era}</span>
                    <span style={{ fontSize: '11px', color: isLocked ? '#ef4444' : '#22c55e' }}>{isLocked ? '🔒 Locked' : '✅ Ready'}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', color: '#f8fafc' }}>{m.title}</h3>
                  <p style={{ fontSize: '12px', color: '#38bdf8', fontStyle: 'italic', marginBottom: '12px' }}>{m.hint}</p>
                  
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
                    <span>Budget: <strong>${m.budget}</strong></span>
                    <span>Goal: <strong>{m.targetAcc}% Accuracy</strong></span>
                  </div>

                  {!isLocked && (
                    <button style={styles.btnPrimary} onClick={() => { setSelectedEra(m); setPipeline({}); setViewState('WORKSPACE'); }}>
                      Start Building &gt;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: BUILDER WORKSPACE */}
      {viewState === 'WORKSPACE' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#f8fafc' }}>{selectedEra.title}</h2>
                <div style={{ fontSize: '12px', color: '#38bdf8' }}>{selectedEra.hint}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <div style={{ color: totalBudgetSpent > selectedEra.budget ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                  Budget: ${totalBudgetSpent} / ${selectedEra.budget}
                </div>
                <div style={{ color: totalRawMem > maxVRAM ? '#ef4444' : '#38bdf8' }}>
                  Memory Needed: {totalRawMem}GB / {maxVRAM}GB Max
                </div>
              </div>
            </div>
          </div>

          {/* PIPELINE SLOTS WITH PLAIN ENGLISH LABELS */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '14px', margin: 0, color: '#f8fafc' }}>Build Your AI Pipeline</h3>
              <button style={styles.btnSuccess} onClick={startSimulation}>▶ Train AI Model</button>
            </div>

            <div style={styles.pipelineFlow}>
              {[
                { key: 'dataset', label: '1. Textbook' },
                { key: 'architecture', label: '2. Brain Net' },
                { key: 'layers', label: '3. Layer Filter' },
                { key: 'optimizer', label: '4. Tutor' },
                { key: 'regularization', label: '5. Anti-Cheat' },
                { key: 'hardware', label: '6. GPU Engine' }
              ].map((slotObj, idx) => {
                const item = pipeline[slotObj.key];
                return (
                  <React.Fragment key={slotObj.key}>
                    <div style={{ ...styles.pipelineSlot, ...(item ? styles.activeSlot : {}) }} onClick={() => setDrawerSlot(slotObj.key)}>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold', position: 'absolute', top: '4px', left: '6px' }}>
                        {slotObj.label}
                      </span>
                      {item ? (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8' }}>{item.name}</div>
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>${item.cost}</div>
                          <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '9px', cursor: 'pointer', marginTop: '4px' }} onClick={(e) => { e.stopPropagation(); removeCard(slotObj.key); }}>Remove</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>+ Select</span>
                      )}
                    </div>
                    {idx < 5 && <span style={{ color: '#334155' }}>➔</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: SIMULATION VIEW */}
      {viewState === 'SIMULATION' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '16px' }}>⚡ Training Your AI Model...</h2>
            
            <div style={{ ...styles.grid3, marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>ACCURACY</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{simMetrics.acc}%</div>
              </div>
              <div style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>MEMORY LOAD</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: simMetrics.vramUsed > maxVRAM ? '#ef4444' : '#38bdf8' }}>{simMetrics.vramUsed} / {maxVRAM} GB</div>
              </div>
              <div style={{ backgroundColor: '#020617', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>RESPONSE TIME</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7' }}>{simMetrics.latency} ms</div>
              </div>
            </div>

            <div style={styles.terminal}>
              {terminalLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: EVALUATION & DEPLOYMENT */}
      {viewState === 'EVALUATION' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={{ fontSize: '20px', color: '#38bdf8', marginBottom: '12px' }}>Pick Where To Launch Your Model</h2>
            
            <div style={{ ...styles.grid3, marginBottom: '20px' }}>
              {DEPLOYMENT_TARGETS.map(t => (
                <div 
                  key={t.id}
                  style={{ 
                    backgroundColor: selectedDeployment.id === t.id ? '#020617' : '#0f172a',
                    border: selectedDeployment.id === t.id ? '2px solid #38bdf8' : '1px solid #1e293b',
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedDeployment(t)}
                >
                  <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px' }}>{t.desc}</div>
                </div>
              ))}
            </div>

            <button style={{ ...styles.btnSuccess, width: '100%', padding: '12px' }} onClick={calculateFinalScore}>
              Finish & Check Score &gt;
            </button>
          </div>

          {/* FINAL SCORE MODAL */}
          {finalScoreCard && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalCard}>
                <h2 style={{ color: finalScoreCard.passed ? '#22c55e' : '#ef4444', marginTop: 0 }}>
                  {finalScoreCard.passed ? '🎉 MISSION COMPLETE!' : '❌ MISSION FAILED'}
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {finalScoreCard.passed ? 'Great job balancing memory, budget, and accuracy!' : 'Try reducing your component budget or using a bigger GPU!'}
                </p>

                <div style={{ backgroundColor: '#020617', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                    <span>Final Accuracy:</span>
                    <strong>{simMetrics.acc}% (Target: {selectedEra.targetAcc}%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Total Money Spent:</span>
                    <strong>${totalBudgetSpent} (Limit: ${selectedEra.budget})</strong>
                  </div>
                </div>

                <button style={{ ...styles.btnPrimary, width: '100%' }} onClick={() => { setFinalScoreCard(null); setViewState('HUB'); }}>
                  Back to Missions &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPONENT SELECTION DRAWER */}
      {drawerSlot && (
        <div style={styles.modalOverlay} onClick={() => setDrawerSlot(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8' }}>Select Component</h3>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setDrawerSlot(null)}>✖</button>
            </div>

            <div style={styles.grid2}>
              {(CARDS_DATABASE[drawerSlot] || []).map(card => (
                <div key={card.id} style={{ backgroundColor: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => equipCard(drawerSlot, card)}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#f8fafc' }}>{card.name}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8', margin: '4px 0' }}>{card.plain}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Cost: ${card.cost} {card.mem ? `| Mem: ${card.mem}GB` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MID-GAME HELP CHALLENGE MODAL */}
      {activeChallenge && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, border: '2px solid #f59e0b' }}>
            <h3 style={{ color: '#f59e0b', marginTop: 0 }}>{activeChallenge.title}</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{activeChallenge.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {activeChallenge.options.map((opt, i) => (
                <button key={i} style={styles.btnPrimary} onClick={opt.action}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}