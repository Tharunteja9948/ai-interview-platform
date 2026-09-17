import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Mic, MicOff, Play, ArrowRight, ArrowLeft, RefreshCw, 
  Compass, ShieldAlert, Award, Activity, TrendingUp, Volume2, VolumeX,
  CheckCircle2, ThumbsUp, ThumbsDown, MessageSquarePlus, 
  AlertTriangle, Lightbulb, Video, VideoOff, Check, CornerDownLeft, 
  Keyboard, Gauge, BookOpen, Maximize2, Minimize2, Shield, Eye, AlertOctagon
} from 'lucide-react';

export default function AdaptivePracticeStudio({ user, sessionConfig, onBack, onCompleteSession }) {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [adaptiveReason, setAdaptiveReason] = useState('');
  const [targetCompetency, setTargetCompetency] = useState('');
  const [seniorTip, setSeniorTip] = useState(null);
  const [interviewMode, setInterviewMode] = useState(sessionConfig?.interviewMode || 'adaptive');
  const totalQuestions = sessionConfig?.questionCount || 3;
  const [isRoundCompleted, setIsRoundCompleted] = useState(false);
  const [roundScores, setRoundScores] = useState([]);
  
  // Pre-Answer Confidence Check (High / Medium / Low)
  const [candidateConfidence, setCandidateConfidence] = useState('medium');
  
  // Real-time voice & STT state
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);

  // Analysis & Feedback state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [questionOrder, setQuestionOrder] = useState(1);
  const [error, setError] = useState(null);

  // AI Interviewer Voice (Text-to-Speech)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Fullscreen & Proctoring State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showProctorModal, setShowProctorModal] = useState(false);
  const [proctorWarningMsg, setProctorWarningMsg] = useState('');

  // Always-On Live Camera Feed
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Audio Canvas Waveform Visualizer
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Roadblock Detour State
  const [showDetourModal, setShowDetourModal] = useState(false);
  const [activeDetour, setActiveDetour] = useState(null);
  const [utilitySubmitted, setUtilitySubmitted] = useState(null);

  const companyName = sessionConfig?.company?.name || 'TCS (Digital & Ninja)';
  const roleName = sessionConfig?.role || 'Software Developer';
  const roundName = sessionConfig?.roundType || 'technical';
  const diffLevel = sessionConfig?.difficulty || 'entry';

  // ---------------------------------------------------------------------------
  // 1. AI Interviewer Speech Synthesis (TTS)
  // ---------------------------------------------------------------------------
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window) || !voiceEnabled || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Alex'))
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      setIsAiSpeaking(false);
    }
  };

  const stopAiSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  // ---------------------------------------------------------------------------
  // 2. Fullscreen Management
  // ---------------------------------------------------------------------------
  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    
    // Auto-prompt enter fullscreen on mount
    enterFullscreen();

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 3. Tab Switching Restriction / Anti-Cheat Proctoring
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !isRoundCompleted) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          setProctorWarningMsg(`Tab switch or window defocus detected! This is Warning ${next} of 3. In a real technical interview, leaving the interview window is an infraction.`);
          setShowProctorModal(true);
          return next;
        });

        // Pause recording if active
        if (isRecording) {
          recognitionRef.current?.stop();
          clearInterval(timerRef.current);
          setIsRecording(false);
          stopAudioWaveform();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isRoundCompleted, isRecording]);

  // ---------------------------------------------------------------------------
  // 4. Always-On Live Camera Initialization
  // ---------------------------------------------------------------------------
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access required for proctored interview. Please allow camera access.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopAiSpeech();
      stopAudioWaveform();
      clearInterval(timerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 5. Audio Waveform Visualizer
  // ---------------------------------------------------------------------------
  const startAudioWaveform = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#6366f1');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight || 4, 3);
          ctx.fill();

          x += barWidth + 2;
        }
      };
      draw();
    } catch (e) {
      console.warn('Audio canvas visualization unavailable:', e);
    }
  };

  const stopAudioWaveform = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach(t => t.stop());
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. Speech Recognition (Web Speech API)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. You can also type your response directly into the text field.');
        }
      };

      recognition.onend = () => {
        // Auto-restart if candidate is still actively recording
        if (isRecording) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording]);

  // Calculate live pacing metrics
  const calculateLiveMetrics = (text, seconds) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
    const minutes = Math.max(seconds / 60, 0.1);
    setLiveWpm(Math.round(words.length / minutes));

    const fillers = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'sort of'];
    let fCount = 0;
    const lower = text.toLowerCase();
    fillers.forEach(f => {
      const regex = new RegExp(`\\b${f}\\b`, 'g');
      const matches = lower.match(regex);
      if (matches) fCount += matches.length;
    });
    setFillerCount(fCount);
  };

  // Toggle Recording
  const handleToggleRecording = () => {
    // Stop AI speech if candidate starts speaking
    stopAiSpeech();

    if (isRecording) {
      recognitionRef.current?.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      stopAudioWaveform();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        startAudioWaveform();
        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => {
            const next = prev + 1;
            setTranscript(current => {
              calculateLiveMetrics(current, next);
              return current;
            });
            return next;
          });
        }, 1000);
      } catch (e) {
        console.error('Speech recognition start failed:', e);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Session Lifecycle & Navigation
  // ---------------------------------------------------------------------------
  const initSession = async (mode = interviewMode) => {
    if (!user) return;
    try {
      setError(null);
      setFeedbackResult(null);
      setTranscript('');
      setRecordingSeconds(0);
      setWordCount(0);
      setLiveWpm(0);
      setUtilitySubmitted(null);
      setIsRoundCompleted(false);
      setRoundScores([]);
      setCandidateConfidence('medium');

      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          role: roleName,
          difficulty: diffLevel,
          interview_mode: mode,
          company: sessionConfig?.company?.id || 'general',
          round_type: roundName
        })
      });

      if (!res.ok) throw new Error('Failed to initialize interview room');
      const data = await res.json();
      setSession(data);
      setCurrentQuestion(data.first_question);
      setAdaptiveReason(data.adaptive_metadata.adaptive_reason);
      setTargetCompetency(data.adaptive_metadata.targeted_competency);
      setSeniorTip(data.first_question?.senior_tip || null);
      setQuestionOrder(1);

      // Speak question aloud via AI interviewer
      if (data.first_question?.question_text) {
        speakQuestion(data.first_question.question_text);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    initSession();
  }, [user, sessionConfig]);

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    stopAiSpeech();
    if (isRecording) {
      recognitionRef.current?.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      stopAudioWaveform();
    }

    const answerText = transcript.trim();
    if (!answerText) {
      alert("Please speak or type your answer before submitting.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const res = await fetch(`/api/session/${session.session_id}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          question_id: currentQuestion.id,
          question_order: questionOrder,
          transcript: answerText,
          duration_seconds: Math.max(15, recordingSeconds),
          interview_mode: interviewMode,
          company: sessionConfig?.company?.id || 'general'
        })
      });

      if (!res.ok) throw new Error('Evaluation pipeline failed');
      const data = await res.json();
      setFeedbackResult(data);
      setRoundScores(prev => [...prev, { 
        q: currentQuestion?.question_text, 
        score: data.scores.total_composite, 
        comp: currentQuestion?.primary_competency 
      }]);

      if (data.detour_triggered && data.detour_info) {
        setActiveDetour(data.detour_info);
        setShowDetourModal(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Next Question
  const handleProceedNext = () => {
    if (!feedbackResult?.next_recommended_question) return;
    const nextQ = feedbackResult.next_recommended_question;
    setCurrentQuestion(nextQ);
    setAdaptiveReason(feedbackResult.adaptive_routing_justification);
    setTargetCompetency(nextQ.primary_competency);
    setSeniorTip(nextQ.senior_tip || null);
    setQuestionOrder(prev => prev + 1);

    setTranscript('');
    setRecordingSeconds(0);
    setWordCount(0);
    setLiveWpm(0);
    setFillerCount(0);
    setFeedbackResult(null);
    setShowDetourModal(false);
    setActiveDetour(null);
    setUtilitySubmitted(null);
    setCandidateConfidence('medium');

    // AI Interviewer speaks next question
    if (nextQ?.question_text) {
      speakQuestion(nextQ.question_text);
    }
  };

  const handleFinishSession = async () => {
    stopAiSpeech();
    stopCamera();
    if (session?.session_id) {
      try {
        await fetch(`/api/session/${session.session_id}/complete`, { method: 'POST' });
      } catch (err) {
        console.error(err);
      }
    }
    if (onCompleteSession) onCompleteSession();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">
      {/* FULLSCREEN LOCK WARNING OVERLAY */}
      {!isFullscreen && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertOctagon size={18} className="text-amber-400 shrink-0" />
            <span className="text-xs font-semibold">
              <b>Proctored Environment:</b> Fullscreen mode is required to simulate authentic placement exam conditions.
            </span>
          </div>
          <button
            onClick={enterFullscreen}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
          >
            <Maximize2 size={13} />
            <span>Enter Fullscreen Room</span>
          </button>
        </div>
      )}

      {/* TOP STATUS BAR: Company, Security Status & Fullscreen Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08] shadow-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
            {companyName} Room
          </span>
          <span className="text-xs text-slate-300 font-semibold">• {roundName.toUpperCase()} ROUND</span>
          <span className="text-[11px] text-slate-500 font-mono">
            (Question #{questionOrder} of {totalQuestions})
          </span>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            <Shield size={11} className="text-emerald-400" />
            <span>Proctored Session</span>
          </div>

          {tabSwitchCount > 0 && (
            <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-500/30">
              ⚠️ {tabSwitchCount} Tab Switch{tabSwitchCount > 1 ? 'es' : ''} Logged
            </span>
          )}
        </div>

        {/* Right Controls: Voice Toggle, Fullscreen, and Mode */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              if (voiceEnabled) {
                stopAiSpeech();
                setVoiceEnabled(false);
              } else {
                setVoiceEnabled(true);
                if (currentQuestion?.question_text) speakQuestion(currentQuestion.question_text);
              }
            }}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition ${
              voiceEnabled 
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300' 
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400'
            }`}
            title="Toggle AI Interviewer Voice"
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="text-[11px] font-medium hidden md:inline">
              {voiceEnabled ? 'AI Voice ON' : 'AI Voice Muted'}
            </span>
          </button>

          <button
            onClick={isFullscreen ? () => document.exitFullscreen?.() : enterFullscreen}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* DUAL SCREEN INTERVIEW ROOM STAGE (Google Meet / HireVue Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT PANE: AI Interviewer Persona Feed */}
        <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden">
          {/* Ambient Glow when AI is Speaking */}
          {isAiSpeaking && (
            <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          )}

          <div className="space-y-4">
            {/* Interviewer Status Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
                  <div className="w-full h-full bg-[#07090E] rounded-[14px] flex items-center justify-center">
                    <Compass className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">AI Technical Interviewer</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {companyName} Senior Panel
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Domain: {currentQuestion?.category || 'Computer Science'}
                  </span>
                </div>
              </div>

              {/* Speaking Waveform Indicator */}
              <div className="flex items-center gap-2">
                {isAiSpeaking ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono animate-pulse border border-cyan-500/40">
                    <Volume2 size={12} />
                    <span>Speaking Question...</span>
                  </span>
                ) : (
                  <button
                    onClick={() => speakQuestion(currentQuestion?.question_text)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[10px] font-mono border border-white/[0.08] transition"
                  >
                    <Volume2 size={12} className="text-cyan-400" />
                    <span>Replay Question</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Text Box */}
            <div className="p-5 rounded-2xl bg-[#07090E] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400 font-semibold">
                  Competency Focus: {targetCompetency?.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                  {currentQuestion?.difficulty} difficulty
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
                "{currentQuestion?.question_text}"
              </h2>
            </div>

            {/* Senior Placement Clue */}
            {seniorTip && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-xs shadow-sm">
                <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300 text-[11px] block">
                    Alumni Insider Tip ({seniorTip.senior_name} • {seniorTip.placed_company}):
                  </span>
                  <p className="text-slate-200 text-[11px] italic leading-relaxed">
                    "{seniorTip.tip_text}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pre-Answer Candidate Confidence Gauge */}
          <div className="p-4 rounded-2xl bg-[#07090E] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Gauge size={14} className="text-cyan-400" />
                <span>Candidate Self-Assessment:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Confidence vs. AI Score
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'high', label: '🟢 High', desc: 'I know this well' },
                { id: 'medium', label: '🟡 Medium', desc: 'General idea' },
                { id: 'low', label: '🔴 Low', desc: 'Need practice' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  disabled={feedbackResult !== null || isAnalyzing}
                  onClick={() => setCandidateConfidence(lvl.id)}
                  className={`p-2 rounded-xl border text-left transition ${
                    candidateConfidence === lvl.id
                      ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200 shadow-md ring-1 ring-cyan-400/30'
                      : 'border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="font-bold text-xs">{lvl.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 truncate">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Candidate Live Proctored Feed & Speech Area */}
        <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Candidate Header & Proctoring Indicator */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white">Candidate Screen: {user?.full_name || 'Candidate'}</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                <span>Pacing: <b className="text-cyan-400">{liveWpm} WPM</b></span>
                <span>• Words: <b className="text-slate-200">{wordCount}</b></span>
                <span>• Fillers: <b className="text-amber-400">{fillerCount}</b></span>
              </div>
            </div>

            {/* Live Camera Feed */}
            <div className="w-full h-44 bg-black rounded-2xl overflow-hidden border border-white/[0.1] relative shadow-xl flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
              
              {/* Camera Status Badge */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed Active</span>
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center">
                  <VideoOff size={24} className="text-rose-400 mb-1" />
                  <span className="text-xs text-rose-300 font-semibold">{cameraError}</span>
                  <button onClick={startCamera} className="mt-2 px-3 py-1 rounded-lg bg-white/[0.1] text-xs text-white">
                    Retry Camera
                  </button>
                </div>
              )}

              {/* Audio Waveform Canvas Overlay */}
              {isRecording && (
                <div className="absolute bottom-2.5 left-2.5 right-2.5 h-8 bg-black/60 backdrop-blur-md rounded-xl p-1 flex items-center justify-center border border-cyan-500/30">
                  <canvas ref={canvasRef} width={380} height={28} className="w-full h-full" />
                </div>
              )}
            </div>

            {/* Speech Transcript & Text Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200 flex items-center gap-2">
                  <span>Your Spoken Response</span>
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-rose-400 animate-pulse font-mono text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Listening ({recordingSeconds}s)...
                    </span>
                  )}
                </label>
                <span className="text-[10px] font-mono text-slate-500">Live Voice-to-Text</span>
              </div>

              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  calculateLiveMetrics(e.target.value, recordingSeconds);
                }}
                disabled={feedbackResult !== null}
                placeholder="Click 'Record Spoken Answer' and speak clearly into your microphone..."
                className="w-full bg-[#07090E] border border-white/[0.08] rounded-2xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-sans placeholder:text-slate-600 transition"
              />
            </div>
          </div>

          {/* Action Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/[0.06]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleToggleRecording}
              disabled={isAnalyzing || feedbackResult !== null}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xl ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]'
              }`}
            >
              {isRecording ? <MicOff size={15} /> : <Mic size={15} className="text-cyan-400" />}
              <span>{isRecording ? 'Stop Answering' : 'Record Spoken Answer'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSubmitAnswer}
              disabled={isAnalyzing || feedbackResult !== null || !transcript.trim()}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xl ${
                !transcript.trim() || feedbackResult !== null
                  ? 'bg-white/[0.04] text-slate-500 border border-white/[0.04] cursor-not-allowed'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-cyan-400/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating 8 Competencies...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Evaluate & Re-Route</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* FEEDBACK SCORECARD VIEW (When Answer Evaluated) */}
      <AnimatePresence>
        {feedbackResult && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 rounded-3xl bg-[#0B0F19] border border-cyan-500/40 shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono block">
                  AI Evaluation Complete • Composite Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {feedbackResult.scores?.total_composite}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0 points</span>
                </div>
              </div>

              {/* 1-Click Real World Drive Feedback — wired to backend */}
              <div className="flex flex-col gap-2 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">
                  🎓 Was this question asked in your campus placement drive?
                </span>

                {utilitySubmitted === 'helpful' ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                    <ThumbsUp size={13} className="text-emerald-400" />
                    <span>Reported! ✅ Priority score updated — this question now ranks higher for all students preparing for <b>{sessionConfig?.company?.name || 'this company'}</b>.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/feedback/real-world-report', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                student_id: user?.id || 1,
                                question_id: currentQuestion?.id,
                                company_name: sessionConfig?.company?.id || 'general',
                                was_asked: true,
                                utility_rating: 5,
                                confidence_level: 'high',
                                student_comment: `Confirmed asked in ${sessionConfig?.company?.name || 'campus'} placement drive by ${user?.full_name || 'student'}`
                              })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setUtilitySubmitted('helpful');
                            }
                          } catch (err) {
                            console.error('Drive report failed:', err);
                            setUtilitySubmitted('helpful'); // optimistic
                          }
                        }}
                        className="px-4 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-1.5 font-semibold transition"
                      >
                        <ThumbsUp size={12} /> Yes, this was asked in my drive (+1 Weightage)
                      </button>

                      <button
                        onClick={() => setUtilitySubmitted('not_asked')}
                        className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-300 flex items-center gap-1 transition"
                      >
                        No
                      </button>
                    </div>

                    {/* Optional tip input */}
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        placeholder={`Add a tip for juniors (e.g. "TCS asked exactly this in Ninja Round 2, 2026 batch")`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-[11px] placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                        id="drive-tip-input"
                      />
                      <button
                        onClick={async () => {
                          const tip = document.getElementById('drive-tip-input')?.value?.trim();
                          if (!tip) return;
                          try {
                            const res = await fetch('/api/feedback/real-world-report', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                student_id: user?.id || 1,
                                question_id: currentQuestion?.id,
                                company_name: sessionConfig?.company?.id || 'general',
                                was_asked: true,
                                utility_rating: 5,
                                confidence_level: 'high',
                                student_comment: tip,
                                senior_tip: tip,
                                student_name: user?.full_name || 'Senior Alumni'
                              })
                            });
                            if (res.ok) setUtilitySubmitted('helpful');
                          } catch (err) {
                            setUtilitySubmitted('helpful');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition whitespace-nowrap"
                      >
                        Submit Tip
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Self-Awareness Calibration (Confidence vs Reality) */}
            {(() => {
              const score = feedbackResult.scores?.total_composite || 0;
              let calTitle = '';
              let calDesc = '';
              let calStyle = '';

              if (candidateConfidence === 'high') {
                if (score >= 3.8) {
                  calTitle = '🎯 Calibrated Precision';
                  calDesc = `Your high self-confidence matched your technical delivery and depth (${score}/5.0).`;
                  calStyle = 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300';
                } else {
                  calTitle = '⚠️ Overconfidence Blindspot';
                  calDesc = `You rated your confidence as High, but the AI evaluation identified gaps (${score}/5.0). Focus on technical precision and structural trade-offs.`;
                  calStyle = 'bg-amber-950/25 border-amber-500/40 text-amber-300';
                }
              } else if (candidateConfidence === 'medium') {
                if (score >= 3.5) {
                  calTitle = '📈 Strong Execution';
                  calDesc = `You demonstrated solid working knowledge (${score}/5.0) matching or exceeding your expectations.`;
                  calStyle = 'bg-cyan-950/25 border-cyan-500/40 text-cyan-300';
                } else {
                  calTitle = '🔄 Targeted Practice Opportunity';
                  calDesc = `You had partial familiarity; targeted practice on this competency will close the gap (${score}/5.0).`;
                  calStyle = 'bg-slate-900 border-white/[0.08] text-slate-300';
                }
              } else {
                if (score >= 3.5) {
                  calTitle = '✨ Imposter Gap (Exceeded Expectations)';
                  calDesc = `You rated your confidence Low, but scored strong (${score}/5.0)! You know more than you give yourself credit for.`;
                  calStyle = 'bg-purple-950/25 border-purple-500/40 text-purple-300';
                } else {
                  calTitle = '🔍 Accurately Diagnosed Weakness';
                  calDesc = `Good self-awareness. You accurately flagged this weak area (${score}/5.0). The adaptive engine will re-route the next question to reinforce this foundational concept.`;
                  calStyle = 'bg-cyan-950/25 border-cyan-500/40 text-cyan-300';
                }
              }

              return (
                <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${calStyle}`}>
                  <Gauge size={18} className="shrink-0 mt-0.5 text-cyan-400" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs">{calTitle}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 border border-white/[0.08]">
                        Pre-Answer Self-Confidence: <b className="text-cyan-400">{candidateConfidence.toUpperCase()}</b>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed">{calDesc}</p>
                  </div>
                </div>
              );
            })()}

            {/* Granular 8-Dimension Competency Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(feedbackResult.scores || {})
                .filter(([k]) => k !== 'total_composite')
                .map(([comp, score]) => (
                  <div key={comp} className="p-3 rounded-2xl bg-black/40 border border-white/[0.04]">
                    <span className="text-[10px] font-mono text-slate-400 block truncate uppercase">
                      {comp.replace('_', ' ')}
                    </span>
                    <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                      {score} <span className="text-[10px] text-slate-500 font-normal">/ 5</span>
                    </span>
                  </div>
                ))}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Key Strengths Identified:
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">{feedbackResult.strengths}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> Recommended Growth Target:
                </span>
                <p className="text-slate-200 text-[11px] leading-relaxed">{feedbackResult.improvements}</p>
              </div>
            </div>

            {/* Unlocked Recruiter Benchmark Model Answer (Revealed ONLY After Scoring) */}
            {feedbackResult.ideal_model_answer && (
              <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <BookOpen size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider font-mono">
                      Unlocked Recruiter Model Answer & Benchmark Points:
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    ✓ Score Evaluated
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {feedbackResult.ideal_model_answer}
                </p>
                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  Compare your spoken response against these points to identify omitted technical keywords.
                </div>
              </div>
            )}

            {/* Next Question Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleFinishSession}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 font-semibold text-xs transition"
              >
                Finish & View Skill Radar
              </button>

              {questionOrder < totalQuestions ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedNext}
                  className="px-7 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-cyan-400/20 transition"
                >
                  <span>Next Question ({questionOrder + 1} of {totalQuestions})</span>
                  <ArrowRight size={15} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleFinishSession();
                    setIsRoundCompleted(true);
                  }}
                  className="px-7 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-xl shadow-emerald-400/20 transition"
                >
                  <Award size={16} />
                  <span>Complete Round & View Scorecard ({totalQuestions}/{totalQuestions})</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROCTORING WARNING MODAL */}
      <AnimatePresence>
        {showProctorModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0B0F19] border border-rose-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
                <ShieldAlert size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">🚨 Proctoring Security Warning</h3>
                <span className="text-[11px] font-mono text-rose-400 block mt-1">
                  Infraction: Unauthorized Tab Switch or Defocus
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {proctorWarningMsg}
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] text-slate-400 font-mono">
                Warning Count: <b className="text-rose-400">{tabSwitchCount}</b> / 3 Allowed
              </div>
              <button
                onClick={() => {
                  setShowProctorModal(false);
                  enterFullscreen();
                }}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition shadow-lg shadow-rose-600/30"
              >
                Acknowledge & Return to Fullscreen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROUND COMPLETED SCORECARD MODAL */}
      <AnimatePresence>
        {isRoundCompleted && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-[#0B0F19] border border-emerald-500/50 rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <Award size={32} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
                  Mock Round Complete
                </span>
                <h2 className="text-2xl font-black text-white">
                  {companyName} Interview Round Complete!
                </h2>
                <p className="text-xs text-slate-400">
                  You completed all {totalQuestions} questions for the {roleName} simulation.
                </p>
              </div>

              {/* Score Overview */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Round Score</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">
                    {roundScores.length > 0 
                      ? (roundScores.reduce((acc, curr) => acc + curr.score, 0) / roundScores.length).toFixed(1)
                      : '3.8'} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Questions Completed</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                    {totalQuestions} of {totalQuestions}
                  </span>
                </div>
              </div>

              {/* Questions Breakdown */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                <span className="text-[11px] font-semibold text-slate-400 block">Performance Summary:</span>
                {roundScores.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[340px]">
                      Q{i+1}: {item.q}
                    </span>
                    <span className="font-bold text-cyan-400 font-mono shrink-0 ml-2">
                      {item.score}/5.0
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsRoundCompleted(false);
                    initSession();
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-bold text-xs transition"
                >
                  Practice Another Round
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsRoundCompleted(false);
                    if (onCompleteSession) onCompleteSession();
                  }}
                  className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs transition shadow-lg shadow-cyan-400/20"
                >
                  View Skill Evolution Radar →
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
