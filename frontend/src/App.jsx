import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import CompanySetupWizard from './components/CompanySetupWizard';
import CompanyQuestionBank from './components/CompanyQuestionBank';
import AdaptivePracticeStudio from './components/AdaptivePracticeStudio';
import StudentEvolutionView from './components/StudentEvolutionView';
import ResearchComparisonView from './components/ResearchComparisonView';
import HumanValidationView from './components/HumanValidationView';
import FacultyDashboard from './components/FacultyDashboard';

import { 
  Compass, Target, FlaskConical, Scale, 
  BarChart3, User, LogOut, Sun, Moon, Monitor, Sparkles,
  Building2, GraduationCap, CheckCircle2, ArrowRight, X, BookOpen
} from 'lucide-react';

export default function App() {
  const DEFAULT_USER = {
    id: 1,
    username: 'rahul_sde',
    full_name: 'Rahul Sharma',
    branch: 'CSE',
    grad_year: 2026,
    target_role: 'Software Developer',
    role_type: 'student'
  };

  const DEFAULT_SESSION = {
    company: { id: 'tcs', name: 'TCS (Digital & Ninja)' },
    role: 'Software Developer',
    roundType: 'technical',
    difficulty: 'entry',
    interviewMode: 'adaptive',
    questionCount: 3
  };

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('app-user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [view, setView] = useState('landing');

  const [sessionConfig, setSessionConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('app-session-config');
      return saved ? JSON.parse(saved) : DEFAULT_SESSION;
    } catch {
      return DEFAULT_SESSION;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem('app-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app-active-view', view);
  }, [view]);

  useEffect(() => {
    if (sessionConfig) localStorage.setItem('app-session-config', JSON.stringify(sessionConfig));
  }, [sessionConfig]);
  const [showVivaModal, setShowVivaModal] = useState(false);

  // Theme Mode
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('app-theme-mode') || 'dark');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      let activeTheme = themeMode;
      if (themeMode === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    applyTheme();
    localStorage.setItem('app-theme-mode', themeMode);
  }, [themeMode]);

  // Quick 1-click persona launcher for examiners & demo
  const handleQuickLaunch = async (username = 'rahul_sde', targetView = 'adaptive_studio', companyConfig = null) => {
    const isFaculty = username === 'faculty_hod';
    const activeUser = isFaculty ? {
      id: 99,
      username: 'faculty_hod',
      full_name: 'Dr. S. K. Roy (HOD)',
      role_type: 'faculty'
    } : DEFAULT_USER;

    setUser(activeUser);
    localStorage.setItem('app-user', JSON.stringify(activeUser));

    if (companyConfig) {
      setSessionConfig(companyConfig);
      localStorage.setItem('app-session-config', JSON.stringify(companyConfig));
    } else if (targetView === 'adaptive_studio') {
      setSessionConfig(DEFAULT_SESSION);
      localStorage.setItem('app-session-config', JSON.stringify(DEFAULT_SESSION));
    }

    const nextView = isFaculty ? 'faculty_dashboard' : (targetView || 'adaptive_studio');
    setView(nextView);
    localStorage.setItem('app-active-view', nextView);

    // Sync in background with backend
    try {
      const password = isFaculty ? 'admin123' : 'pass123';
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        const syncedUser = data.user || data;
        setUser(syncedUser);
        localStorage.setItem('app-user', JSON.stringify(syncedUser));
      }
    } catch (err) {
      console.warn('Backend login sync fallback active:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('app-user');
    localStorage.setItem('app-active-view', 'landing');
    setUser(null);
    setView('landing');
    setSessionConfig(null);
  };

  const handleLaunchFromWizard = (config) => {
    setSessionConfig(config);
    setView('adaptive_studio');
  };

  const renderThemeSwitcher = () => (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
        title="Toggle Appearance Theme"
      >
        {themeMode === 'dark' ? <Moon size={16} /> : themeMode === 'light' ? <Sun size={16} /> : <Monitor size={16} />}
      </button>

      {isThemeDropdownOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-1 text-xs text-slate-200">
          <button 
            onClick={() => { setThemeMode('light'); setIsThemeDropdownOpen(false); }}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2"
          >
            <Sun size={14} /> Light
          </button>
          <button 
            onClick={() => { setThemeMode('dark'); setIsThemeDropdownOpen(false); }}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2"
          >
            <Moon size={14} /> Dark
          </button>
          <button 
            onClick={() => { setThemeMode('system'); setIsThemeDropdownOpen(false); }}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-2"
          >
            <Monitor size={14} /> System
          </button>
        </div>
      )}
    </div>
  );

  // 1. Landing View (First thing seen by any visitor)
  if (view === 'landing') {
    return (
      <LandingPage 
        onNavigateToAuth={() => setView('auth')}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />
    );
  }

  // 2. Auth View (When User clicks Sign In / Register)
  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center p-6">
        <AuthForm 
          onAuthSuccess={(userData) => {
            setUser(userData);
            if (userData.role_type === 'faculty') {
              setView('faculty_dashboard');
            } else {
              setView('setup_wizard');
            }
          }}
          onBackToLanding={() => setView('landing')}
        />
      </div>
    );
  }

  // 3. Safety guard — if user is null but view is not landing/auth, redirect to landing
  if (!user) {
    return (
      <LandingPage 
        onNavigateToAuth={() => setView('auth')}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />
    );
  }

  // 4. Authenticated App Layout (Academic Navigation Bar + Active Views)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Academic Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer self-start lg:self-auto"
            onClick={() => setView('setup_wizard')}
          >
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                Self-Learning AI Interview Platform
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                B.Tech CSE Final Year Project • Batch 1
              </span>
            </div>
          </div>

          {/* Academic Tabs */}
          <nav className="flex flex-wrap items-center gap-1 text-xs">
            <button
              onClick={() => setView('landing')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'landing'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Overview
            </button>

            <button
              onClick={() => setView('setup_wizard')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'setup_wizard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company Setup
            </button>

            <button
              onClick={() => setView('question_bank')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'question_bank'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Company Questions
            </button>

            <button
              onClick={() => setView('adaptive_studio')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'adaptive_studio'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              Adaptive Studio
            </button>

            <button
              onClick={() => setView('student_evolution')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'student_evolution'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Target className="w-4 h-4" />
              Skill Evolution & Word Diff
            </button>

            <button
              onClick={() => setView('research_study')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'research_study'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Adaptive vs. Static Study
            </button>

            <button
              onClick={() => setView('human_validation')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'human_validation'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Scale className="w-4 h-4" />
              Human Validation
            </button>

            <button
              onClick={() => setView('faculty_dashboard')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                view === 'faculty_dashboard'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Faculty Analytics
            </button>

            {/* 7-Min Viva Demo Guide Button */}
            <button
              onClick={() => setShowVivaModal(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 hover:bg-amber-500/25 transition ml-1"
            >
              <GraduationCap size={14} />
              7-Min Viva Guide
            </button>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            {renderThemeSwitcher()}
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200">{user.full_name || user.username}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                {user.role_type}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area with Fluid Framer Motion Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {view === 'setup_wizard' && (
          <CompanySetupWizard 
            user={user}
            onLaunchInterview={handleLaunchFromWizard}
            onBackToDashboard={() => setView('student_evolution')}
          />
        )}

        {view === 'question_bank' && (
            <CompanyQuestionBank 
              onStartPractice={(question, comp) => {
                setSessionConfig({
                  company: comp,
                  role: question.role || 'Software Developer',
                  roundType: 'technical',
                  difficulty: question.difficulty || 'entry',
                  interviewMode: 'adaptive',
                  questionCount: 3
                });
                setView('adaptive_studio');
              }}
            />
          )}

          {view === 'adaptive_studio' && (
          <AdaptivePracticeStudio 
            user={user}
            sessionConfig={sessionConfig}
            onBack={() => setView('student_evolution')}
            onCompleteSession={() => setView('student_evolution')}
          />
        )}

        {view === 'student_evolution' && (
          <StudentEvolutionView 
            user={user}
            onBack={() => setView('adaptive_studio')}
            onStartPractice={() => setView('setup_wizard')}
          />
        )}

        {view === 'research_study' && (
          <ResearchComparisonView 
            onBack={() => setView('adaptive_studio')}
          />
        )}

        {view === 'human_validation' && (
          <HumanValidationView 
            onBack={() => setView('adaptive_studio')}
          />
        )}

        {view === 'faculty_dashboard' && (
          <FacultyDashboard 
            user={user}
            onBack={() => setView('adaptive_studio')}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 7-MINUTE VIVA DEMONSTRATION POPUP MODAL */}
      {showVivaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">7-Minute Viva Live Demonstration Script</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Guide Section 17 • Step-by-Step Examiner Sequence</span>
                </div>
              </div>
              <button 
                onClick={() => setShowVivaModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { time: '0:00 - 1:00', title: '1. Login & Company Setup', desc: 'Login as Rahul Sharma. Select Tier 1 (Google/Amazon) or Tier 3 (TCS). Review hardware diagnostics check.' },
                { time: '1:00 - 2:00', title: '2. Show Baseline Skill Profile', desc: 'Open Skill Evolution. Show radar chart with initial weak structure (2.1/5) & evidence (1.8/5).' },
                { time: '2:00 - 3:15', title: '3. Live Spoken Interview #1', desc: 'Answer aloud into microphone. Point to live WPM counter, filler word detector, and Speech-to-Text transcript.' },
                { time: '3:15 - 4:00', title: '4. Instant 8-Dimension Evaluation', desc: 'Click Evaluate & Re-route. Show 8-dimension scorecard and the explainable Google Maps re-routing rationale.' },
                { time: '4:00 - 5:00', title: '5. Targeted Remediation Question #2', desc: 'Show that Question #2 specifically targets the diagnosed weak competency with Senior Alumni tip guidance.' },
                { time: '5:00 - 5:45', title: '6. Visual Word Evolution Diff', desc: 'Show side-by-side transcripts with Green highlights for added technical terms and Red strikethroughs for eliminated fillers.' },
                { time: '5:45 - 6:30', title: '7. Adaptive vs. Static Study Benchmark', desc: 'Switch to Adaptive vs Static tab. Prove Batch 1 Pitch hypothesis (+0.86 vs +0.14 gain, p < 0.01).' },
                { time: '6:30 - 7:00', title: '8. Faculty Analytics & Viva Close', desc: 'Open Faculty Analytics. Show anonymized cohort gaps for TPO. Recite the One-Sentence Viva Definition.' }
              ].map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-cyan-300 shrink-0 font-bold">
                    {step.time}
                  </span>
                  <div>
                    <span className="font-bold text-slate-200 block">{step.title}</span>
                    <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200">
              <b>One-Sentence Viva Definition:</b> "We developed a self-learning interview coach that builds a personalized competency profile from a student’s spoken answers, uses detected weaknesses to re-route the next practice questions, and measures how the student’s answers evolve across repeated interviews."
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVivaModal(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
              >
                Close & Run Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
