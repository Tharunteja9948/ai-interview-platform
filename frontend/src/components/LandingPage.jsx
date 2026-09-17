import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Compass, Building2, ArrowUpRight,
  Mic, Brain, TrendingUp, Sun, Moon, Monitor, LogIn, UserPlus
} from 'lucide-react';

export default function LandingPage({ onNavigateToAuth, themeMode, onThemeChange }) {
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    }
  };

  const isDark = themeMode !== 'light';

  const TRACKS = [
    {
      id: 'google',
      tier: 'Tier 1',
      title: 'Product Giants & Scale',
      badge: 'FAANG',
      desc: 'Data structures, algorithms, system design, and distributed systems.',
      companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix'],
      accent: isDark ? 'from-cyan-500/10 via-slate-900 to-slate-950' : 'from-cyan-50 via-white to-slate-50',
      border: isDark ? 'border-cyan-500/30 hover:border-cyan-400/60' : 'border-cyan-300 hover:border-cyan-500',
      tagColor: isDark ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-cyan-100 text-cyan-700 border-cyan-300'
    },
    {
      id: 'cred',
      tier: 'Tier 2',
      title: 'Startups & FinTech',
      badge: 'Unicorns',
      desc: 'Microservices, payment systems, event-driven architecture, and rapid ownership.',
      companies: ['CRED', 'Razorpay', 'Uber', 'Flipkart', 'Swiggy', 'PhonePe'],
      accent: isDark ? 'from-purple-500/10 via-slate-900 to-slate-950' : 'from-purple-50 via-white to-slate-50',
      border: isDark ? 'border-purple-500/30 hover:border-purple-400/60' : 'border-purple-300 hover:border-purple-500',
      tagColor: isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300'
    },
    {
      id: 'tcs',
      tier: 'Tier 3',
      title: 'Enterprise & IT Services',
      badge: 'Campus',
      desc: 'Core CS fundamentals, OOP, DBMS, Java/C++, and STAR communication.',
      companies: ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini'],
      accent: isDark ? 'from-emerald-500/10 via-slate-900 to-slate-950' : 'from-emerald-50 via-white to-slate-50',
      border: isDark ? 'border-emerald-500/30 hover:border-emerald-400/60' : 'border-emerald-300 hover:border-emerald-500',
      tagColor: isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
    }
  ];

  const FEATURES = [
    { icon: Mic, title: 'Voice-Powered', desc: 'Speak your answers naturally with real-time speech recognition' },
    { icon: Brain, title: 'AI Evaluation', desc: 'Instant feedback across 8 competency dimensions' },
    { icon: TrendingUp, title: 'Adaptive Routing', desc: 'Questions adapt to target your weakest areas first' }
  ];

  // Theme colors
  const bg = isDark ? 'bg-[#07090E]' : 'bg-[#f8fafc]';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const headerBg = isDark ? 'bg-[#07090E]/80' : 'bg-white/80';
  const headerBorder = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  const cardBg = isDark ? 'bg-white/[0.04]' : 'bg-white';
  const cardBorder = isDark ? 'border-white/[0.08]' : 'border-slate-200';
  const footerBorder = isDark ? 'border-white/[0.06]' : 'border-slate-200';

  return (
    <div className={`min-h-screen ${bg} ${textPrimary} flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden`}>
      {/* Subtle Ambient Background */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0d_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/[0.04] blur-[140px] pointer-events-none rounded-full" />
        </>
      )}

      {/* Top Navbar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`border-b ${headerBorder} ${headerBg} backdrop-blur-xl sticky top-0 z-50 px-6 py-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className={`w-full h-full ${isDark ? 'bg-[#07090E]' : 'bg-white'} rounded-[10px] flex items-center justify-center`}>
                <Compass className="w-4 h-4 text-cyan-500" />
              </div>
            </div>
            <div>
              <span className={`font-extrabold text-sm tracking-tight ${textPrimary} block`}>
                InterviewAI
              </span>
              <span className={`text-[10px] ${textMuted} font-mono block`}>
                Self-Learning Interview Platform
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle + Auth Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className={`p-2 rounded-lg ${isDark ? 'bg-white/[0.06] border-white/[0.08] text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'} border transition`}
                title="Toggle Theme"
              >
                {themeMode === 'dark' ? <Moon size={16} /> : themeMode === 'light' ? <Sun size={16} /> : <Monitor size={16} />}
              </button>
              {isThemeOpen && (
                <div className={`absolute right-0 mt-2 w-32 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl shadow-xl z-50 p-1 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <button 
                    onClick={() => { onThemeChange('light'); setIsThemeOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button 
                    onClick={() => { onThemeChange('dark'); setIsThemeOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                  <button 
                    onClick={() => { onThemeChange('system'); setIsThemeOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} flex items-center gap-2`}
                  >
                    <Monitor size={14} /> System
                  </button>
                </div>
              )}
            </div>

            {/* Login & Sign Up */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToAuth}
              className={`px-3.5 py-2 text-xs font-semibold ${isDark ? 'text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'} border rounded-xl transition flex items-center gap-1.5`}
            >
              <LogIn size={14} />
              <span>Log In</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToAuth}
              className="px-4 py-2 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-400/20 flex items-center gap-1.5 transition"
            >
              <UserPlus size={14} />
              <span>Sign Up Free</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16 flex-1 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          {/* Headline */}
          <motion.h1 variants={itemVariants} className={`text-4xl sm:text-5xl md:text-6xl font-black ${textPrimary} tracking-tight leading-[1.12]`}>
            Practice interviews the way{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500">
              Google Maps navigates traffic.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className={`${textSecondary} text-sm sm:text-base leading-relaxed max-w-2xl mx-auto`}>
            Our AI tutoring system diagnoses your weakest competencies in real-time and dynamically re-routes questions to turn bottlenecks into strengths. Speak naturally, get instant feedback.
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-sm tracking-wide shadow-xl shadow-cyan-400/25 flex items-center justify-center gap-2 transition"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {FEATURES.map((feat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`p-5 rounded-2xl ${cardBg} border ${cardBorder} flex flex-col gap-3`}
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <feat.icon size={20} className="text-cyan-500" />
              </div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>{feat.title}</h3>
              <p className={`text-xs ${textMuted} leading-relaxed`}>{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Company Tracks */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary} tracking-tight flex items-center gap-2`}>
                <Building2 className="text-cyan-500" size={18} />
                Company Recruitment Tracks
              </h2>
              <p className={`text-xs ${textMuted}`}>24 companies across 3 tiers — sign up to start practicing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRACKS.map((track) => (
              <motion.div
                key={track.id}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={onNavigateToAuth}
                className={`p-6 rounded-2xl bg-gradient-to-b ${track.accent} border ${track.border} cursor-pointer transition-all duration-200 flex flex-col justify-between group`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${track.tagColor} font-mono`}>
                      {track.badge}
                    </span>
                    <div className={`w-7 h-7 rounded-full ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'} flex items-center justify-center ${textMuted} group-hover:text-cyan-500 transition`}>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <div>
                    <span className={`text-[10px] font-mono ${textMuted} uppercase tracking-wide block`}>{track.tier}</span>
                    <h3 className={`text-lg font-bold ${textPrimary} tracking-tight mt-0.5`}>{track.title}</h3>
                    <p className={`text-xs ${textSecondary} leading-relaxed mt-2`}>{track.desc}</p>
                  </div>
                </div>

                <div className={`pt-5 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'} mt-6`}>
                  <div className="flex flex-wrap gap-1.5">
                    {track.companies.map((c, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded-lg ${isDark ? 'bg-black/40 text-slate-300 border-white/[0.08]' : 'bg-slate-100 text-slate-600 border-slate-200'} border font-medium`}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${footerBorder} py-6 px-6 text-center text-xs ${textMuted} font-mono relative z-10`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>B.Tech CSE Final Year Project • Self-Learning AI Interview Platform</span>
          <span className={textSecondary}>© 2026 InterviewAI</span>
        </div>
      </footer>
    </div>
  );
}
