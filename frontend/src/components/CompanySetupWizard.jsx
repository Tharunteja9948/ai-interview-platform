import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Globe, Package, Cpu, Network, ShieldCheck, Zap, 
  Navigation, ShoppingBag, Award, Terminal, Layers, Code2, 
  CheckCircle2, Mic, Video, Volume2, ArrowRight, ArrowLeft, 
  Sparkles, Check, AlertCircle, Compass, HelpCircle
} from 'lucide-react';

const ICON_MAP = {
  Globe: Globe,
  Package: Package,
  Cpu: Cpu,
  Network: Network,
  ShieldCheck: ShieldCheck,
  Zap: Zap,
  Navigation: Navigation,
  ShoppingBag: ShoppingBag,
  Award: Award,
  Terminal: Terminal,
  Layers: Layers,
  Code2: Code2,
  Building: Building2
};

export default function CompanySetupWizard({ user, onLaunchInterview, onBackToDashboard }) {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Category, 2: Company, 3: Role & Round, 4: Diagnostics

  // Selected State
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [role, setRole] = useState('Software Developer');
  const [roundType, setRoundType] = useState('technical');
  const [difficulty, setDifficulty] = useState('entry');
  const [interviewMode, setInterviewMode] = useState('adaptive'); // 'adaptive' or 'conventional'
  const [questionCount, setQuestionCount] = useState(3);

  // Hardware Diagnostics State
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'testing' | 'success' | 'error'
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [consentGranted, setConsentGranted] = useState(true);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch Company Tiers from Backend
  useEffect(() => {
    fetch('/api/companies/tiers')
      .then(res => res.json())
      .then(data => {
        setTiers(data);
        if (data.length > 0) {
          setSelectedTier(data[0]);
          if (data[0].companies?.length > 0) {
            setSelectedCompany(data[0].companies[0]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load company tiers:', err);
        setLoading(false);
      });
  }, []);

  // Hardware Diagnostics: Test Microphone
  const testMicrophone = async () => {
    try {
      setMicStatus('testing');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      setTimeout(() => {
        setMicStatus('success');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMicStatus('error');
    }
  };

  // Hardware Diagnostics: Test Camera
  const testCamera = async () => {
    try {
      setCameraStatus('testing');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStatus('success');
    } catch (err) {
      console.error(err);
      setCameraStatus('error');
    }
  };

  // Clean up streams on unmount or step change
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const handleLaunch = () => {
    onLaunchInterview({
      tier: selectedTier,
      company: selectedCompany,
      role,
      roundType,
      difficulty,
      interviewMode,
      questionCount
    });
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Company Architecture & Placement Tiers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Company Tier' },
            { num: 2, label: 'Target Company' },
            { num: 3, label: 'Role & Round' },
            { num: 4, label: 'Diagnostics Check' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? 'bg-cyan-500 text-white ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`text-[11px] font-medium tracking-tight ${
                  step === s.num ? 'text-cyan-400 font-semibold' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-colors ${
                  step > s.num ? 'bg-emerald-500/50' : 'bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

            <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="space-y-6"
          >
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white tracking-tight">Select Company Category</h2>
            <p className="text-slate-400 text-xs mt-1">
              Choose the tier of companies you want to simulate. Each category adjusts question rigor and evaluation depth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((t) => {
              const isSelected = selectedTier?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTier(t);
                    if (t.companies?.length > 0) setSelectedCompany(t.companies[0]);
                  }}
                  className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        t.badge_color === 'cyan' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                        t.badge_color === 'purple' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {t.id.replace('tier', 'Tier ').replace('_', ' • ')}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                          <Check size={12} />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{t.name}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{t.description}</p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-300 mb-2">Featured Companies:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.companies?.map(c => (
                        <span key={c.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition"
            >
              Continue to Select Company
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: SELECT SPECIFIC COMPANY CARD */}
      {step === 2 && (
        <motion.div 
          key="step2"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="space-y-6"
        >
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Select Specific Company
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Category: <span className="text-cyan-400 font-semibold">{selectedTier?.name}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {selectedTier?.companies?.map((comp) => {
              const isSelected = selectedCompany?.id === comp.id;
              const IconComp = ICON_MAP[comp.logo_icon] || Building2;
              return (
                <div
                  key={comp.id}
                  onClick={() => { setSelectedCompany(comp); setIsCustomCompany(false); }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/70 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <IconComp size={22} />
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        comp.difficulty_tier === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        comp.difficulty_tier === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {comp.difficulty_tier}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">{comp.name}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3">{comp.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block mb-1">Evaluation Focus:</span>
                    <span className="text-[11px] font-medium text-slate-300 block truncate">
                      {comp.typical_focus}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Custom Company Option */}
            <div
              onClick={() => {
                setIsCustomCompany(true);
                setSelectedCompany({
                  id: 'custom',
                  name: customCompanyName || 'Custom Company',
                  logo_icon: 'Building2',
                  description: 'Practice with any custom company of your choice',
                  difficulty_tier: 'medium',
                  typical_focus: 'General CS & Role Focus'
                });
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isCustomCompany
                  ? 'bg-cyan-950/30 border-cyan-500/70 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${
                    isCustomCompany ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Sparkles size={22} />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Custom
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">Custom Company...</h4>
                <p className="text-slate-400 text-xs mb-3">Type any dream company (e.g. Netflix, Cisco, Tesla, Goldman Sachs)</p>
              </div>

              {isCustomCompany && (
                <div className="pt-2 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={customCompanyName}
                    onChange={(e) => {
                      setCustomCompanyName(e.target.value);
                      setSelectedCompany({
                        id: 'custom',
                        name: e.target.value || 'Custom Company',
                        logo_icon: 'Building2',
                        description: 'Customized mock session',
                        difficulty_tier: 'medium',
                        typical_focus: 'Tailored Practice'
                      });
                    }}
                    placeholder="Enter company name..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/50 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition"
            >
              <ArrowLeft size={16} /> Back to Categories
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedCompany}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition"
            >
              Configure Role & Round
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: ROLE, ROUND, DIFFICULTY & ENGINE MODE */}
      {step === 3 && (
        <motion.div 
          key="step3"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="space-y-6"
        >
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white tracking-tight">Interview Configuration</h2>
            <p className="text-slate-400 text-xs mt-1">
              Target Company: <span className="text-cyan-400 font-semibold">{selectedCompany?.name}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Left: Role & Round */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Software Developer">💻 Software Developer (SDE-1 / Core SWE)</option>
                  <option value="Python Developer">🐍 Python Developer (Django, FastAPI, Asyncio & GIL)</option>
                  <option value="Java Developer">☕ Java Developer (Core Java, Spring Boot, Concurrency & JVM)</option>
                  <option value="Full Stack Developer">🌐 Full Stack Developer (MERN / Spring + React)</option>
                  <option value="Frontend Engineer">🎨 Frontend Engineer (React / Modern Web)</option>
                  <option value="Backend Engineer">⚙️ Backend & Microservices Engineer (APIs / Concurrency)</option>
                  <option value="Data Engineer & Analytics">📊 Data Engineer & Analytics (SQL, ETL, Spark)</option>
                  <option value="AI / Machine Learning Engineer">🤖 AI & Machine Learning Engineer (Deep Learning, NLP)</option>
                  <option value="Cloud & DevOps Engineer">☁️ Cloud & DevOps Engineer (Docker, K8s, AWS)</option>
                  <option value="Cybersecurity Analyst">🛡️ Cybersecurity Analyst (OWASP, Network & Infosec)</option>
                  <option value="QA Automation & SDET">🧪 QA Automation & SDET (Testing Architecture, Selenium)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Interview Round Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'technical', label: 'Technical & System Design' },
                    { id: 'behavioral', label: 'HR / STAR Behavioral' },
                    { id: 'managerial', label: 'Managerial & Projects' },
                    { id: 'coding_logic', label: 'Algorithms & OOP' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoundType(r.id)}
                      className={`p-2.5 rounded-xl text-left text-xs border transition ${
                        roundType === r.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Questions in this Round</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 3, label: '3 Questions', sub: 'Quick Practice' },
                    { count: 5, label: '5 Questions', sub: 'Standard Mock' },
                    { count: 10, label: '10 Questions', sub: 'Complete Interview' }
                  ].map(qc => (
                    <button
                      key={qc.count}
                      type="button"
                      onClick={() => setQuestionCount(qc.count)}
                      className={`p-2 rounded-xl text-center text-xs border transition ${
                        questionCount === qc.count
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold">{qc.label}</div>
                      <div className="text-[10px] text-slate-500">{qc.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'entry', label: 'Entry / Campus' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'advanced', label: 'Advanced' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`py-2 rounded-xl text-center text-xs border transition ${
                        difficulty === d.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Engine Mode Selection (Adaptive vs Conventional Benchmark) */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Interview Engine Mode</h3>
                </div>
                <p className="text-slate-400 text-xs mb-4">
                  Select which intelligence algorithm drives question routing for this session:
                </p>

                <div className="space-y-3">
                  <div
                    onClick={() => setInterviewMode('adaptive')}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      interviewMode === 'adaptive'
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles size={14} className="text-cyan-400" />
                        Adaptive Google Maps Engine
                      </span>
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono uppercase">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Dynamically detects your 2 weakest competencies and recalculates the question route after every answer.
                    </p>
                  </div>

                  <div
                    onClick={() => setInterviewMode('conventional')}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      interviewMode === 'conventional'
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">
                        Conventional Static Mock Mode
                      </span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono uppercase">
                        Control Group
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Questions appear in fixed sequential catalog order without diagnosing or targeting individual weaknesses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                💡 <span className="text-slate-300 font-medium">Batch 1 Research Note:</span> Testing both modes lets you demonstrate the empirical learning gain difference to external examiners.
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 max-w-4xl mx-auto">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition"
            >
              <ArrowLeft size={16} /> Back to Company
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition"
            >
              Proceed to Diagnostics Check
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: HARDWARE DIAGNOSTICS (MIC, CAMERA, STT) */}
      {step === 4 && (
        <motion.div 
          key="step4"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">System & Hardware Diagnostics</h2>
            <p className="text-slate-400 text-xs mt-1">
              Verify your microphone and camera to ensure speech-to-text and acoustic pacing metrics function properly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Microphone Test */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                    <Mic size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Microphone Input</h4>
                    <span className="text-[10px] text-slate-400">Audio capture & WPM metrics</span>
                  </div>
                </div>
                {micStatus === 'success' && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Ready
                  </span>
                )}
              </div>

              {/* Audio Level Visualizer */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Input Volume</span>
                  <span>{audioLevel}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>

              <button
                onClick={testMicrophone}
                disabled={micStatus === 'testing'}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-semibold transition"
              >
                {micStatus === 'testing' ? 'Listening...' : micStatus === 'success' ? 'Re-Test Mic' : 'Test Microphone'}
              </button>
            </div>

            {/* Camera Test */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                    <Video size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Video Feed Preview</h4>
                    <span className="text-[10px] text-slate-400">Professional eye-contact simulation</span>
                  </div>
                </div>
                {cameraStatus === 'success' && (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                )}
              </div>

              {/* Video Box */}
              <div className="w-full h-28 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${cameraStatus === 'success' ? 'block' : 'hidden'}`}
                />
                {cameraStatus !== 'success' && (
                  <span className="text-xs text-slate-500">Camera preview inactive</span>
                )}
              </div>

              <button
                onClick={testCamera}
                disabled={cameraStatus === 'testing'}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-semibold transition"
              >
                {cameraStatus === 'testing' ? 'Connecting...' : cameraStatus === 'success' ? 'Camera Working' : 'Enable Camera'}
              </button>
            </div>
          </div>

          {/* Ethical AI & Microphone Consent */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <input 
              type="checkbox"
              id="consent"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="mt-0.5 rounded text-cyan-500 focus:ring-cyan-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
              I consent to temporary local microphone audio processing for real-time speech-to-text and acoustic delivery metrics. Recordings are not stored permanently (Section 4 Compliance).
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-2 transition"
            >
              <ArrowLeft size={16} /> Back to Config
            </button>
            <button
              onClick={handleLaunch}
              disabled={!consentGranted}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-cyan-600/30 transition transform hover:-translate-y-0.5"
            >
              <Sparkles size={16} />
              Launch {selectedCompany?.name} Interview Studio
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
