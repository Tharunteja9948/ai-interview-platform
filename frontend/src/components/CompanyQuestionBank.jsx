import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Building2, Award, ChevronDown, ChevronUp, 
  Sparkles, CheckCircle2, ShieldCheck, Zap, Globe, Cpu, Lightbulb, Play,
  Plus, X, Send, ThumbsUp, Check, MessageSquarePlus
} from 'lucide-react';

const POPULAR_COMPANIES = [
  { id: 'tcs', name: 'TCS (Digital/Ninja)', tier: 'Enterprise' },
  { id: 'infosys', name: 'Infosys (Specialist)', tier: 'Enterprise' },
  { id: 'wipro', name: 'Wipro (Turbo/Elite)', tier: 'Enterprise' },
  { id: 'accenture', name: 'Accenture', tier: 'Enterprise' },
  { id: 'capgemini', name: 'Capgemini', tier: 'Enterprise' },
  { id: 'google', name: 'Google', tier: 'Tier 1' },
  { id: 'amazon', name: 'Amazon', tier: 'Tier 1' },
  { id: 'microsoft', name: 'Microsoft', tier: 'Tier 1' },
  { id: 'meta', name: 'Meta', tier: 'Tier 1' },
  { id: 'apple', name: 'Apple', tier: 'Tier 1' },
  { id: 'netflix', name: 'Netflix', tier: 'Tier 1' },
  { id: 'razorpay', name: 'Razorpay', tier: 'FinTech' },
  { id: 'cred', name: 'CRED', tier: 'FinTech' },
  { id: 'uber', name: 'Uber', tier: 'Tech Startup' },
  { id: 'swiggy', name: 'Swiggy', tier: 'Tech Startup' }
];

export default function CompanyQuestionBank({ onStartPractice }) {
  const [selectedCompany, setSelectedCompany] = useState('tcs');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  
  // Real-world drive report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [reportSuccessMsg, setReportSuccessMsg] = useState(null);
  
  // Report Form State
  const [reportCompany, setReportCompany] = useState('tcs');
  const [reportMode, setReportMode] = useState('new'); // 'new' | 'existing'
  const [existingQuestionId, setExistingQuestionId] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCategory, setNewCategory] = useState('Core CS & Technical');
  const [seniorTip, setSeniorTip] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    fetchQuestions(selectedCompany);
  }, [selectedCompany]);

  const fetchQuestions = async (compId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/questions/company/${compId}`);
      if (!res.ok) throw new Error('Failed to load questions');
      const data = await res.json();
      setQuestions(data.questions || []);
      if (data.questions?.length > 0) {
        setExpandedId(data.questions[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click upvote: "Asked in My Drive (+1)"
  const handleQuickUpvote = async (qId, compId, e) => {
    e.stopPropagation();
    if (upvotedIds.has(qId)) return;
    
    try {
      setUpvotedIds(prev => new Set([...prev, qId]));
      const res = await fetch('/api/feedback/real-world-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 1,
          question_id: qId,
          company_name: compId,
          was_asked: true,
          utility_rating: 5,
          confidence_level: 'high',
          student_comment: 'Verified in recent campus placement drive'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReportSuccessMsg(`🔥 Verified! Live priority updated to ${data.new_priority_score} for ${compId.toUpperCase()}.`);
        setTimeout(() => setReportSuccessMsg(null), 4000);
        fetchQuestions(selectedCompany);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit full report modal form
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (reportMode === 'new' && !newQuestionText.trim()) {
      alert('Please enter the question text asked in your drive.');
      return;
    }
    if (reportMode === 'existing' && !existingQuestionId) {
      alert('Please select an existing question.');
      return;
    }

    try {
      setIsSubmittingReport(true);
      const payload = {
        student_id: 1,
        company_name: reportCompany,
        was_asked: true,
        utility_rating: 5,
        confidence_level: 'high',
        student_comment: 'Reported by campus drive participant',
        senior_tip: seniorTip.trim() || undefined,
        student_name: studentName.trim() || 'Senior Alumni'
      };

      if (reportMode === 'new') {
        payload.question_id = 'custom';
        payload.new_question_text = newQuestionText.trim();
        payload.new_question_category = newCategory;
      } else {
        payload.question_id = existingQuestionId;
      }

      const res = await fetch('/api/feedback/real-world-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to record drive report');
      const result = await res.json();

      setShowReportModal(false);
      setNewQuestionText('');
      setSeniorTip('');
      setStudentName('');
      setReportSuccessMsg(`✅ Drive question recorded! Priority increased to ${result.new_priority_score}. It now ranks higher for all students.`);
      setTimeout(() => setReportSuccessMsg(null), 5000);
      
      // If report was for current selected company, refresh immediately
      if (selectedCompany === reportCompany) {
        fetchQuestions(selectedCompany);
      } else {
        setSelectedCompany(reportCompany);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report: ' + err.message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const term = searchQuery.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      (q.ideal_answer && q.ideal_answer.toLowerCase().includes(term))
    );
  });

  const activeCompInfo = POPULAR_COMPANIES.find(c => c.id === selectedCompany) || {
    name: selectedCompany.toUpperCase(),
    tier: 'Target Company'
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B0F19] via-[#0F172A] to-[#0B0F19] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
              Placement Archive
            </span>
            <span className="text-xs text-slate-400 font-medium">• Verified Campus Drives</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <BookOpen className="text-cyan-400" size={24} />
            Company Interview Questions & Ideal Answers
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed font-normal">
            Authentic questions asked in technical & HR rounds at top recruiters, paired with ideal answer breakdowns, crowdsourced weightages, and senior alumni advice.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setReportCompany(selectedCompany);
              setShowReportModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition whitespace-nowrap"
          >
            <Sparkles size={14} />
            <span>Report Drive Question (+Weightage)</span>
          </motion.button>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Total in Archive</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">105+</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {reportSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{reportSuccessMsg}</span>
          </div>
          <button onClick={() => setReportSuccessMsg(null)} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Company Selector Ribbon with Animated Sliding Pill */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 block font-mono uppercase tracking-wider text-[10px]">
          Select Target Recruiter:
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {POPULAR_COMPANIES.map(c => {
            const isSelected = selectedCompany === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompany(c.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCompanyTab"
                    className="absolute inset-0 bg-cyan-500/15 border border-cyan-500/50 rounded-xl shadow-lg shadow-cyan-500/10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Building2 size={13} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                  <span>{c.name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400 font-mono">
                    {c.tier}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Overview Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeCompInfo.name} questions...`}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
          <span>Showing <b>{filteredQuestions.length}</b> questions for <b className="text-cyan-400">{activeCompInfo.name}</b></span>
        </div>
      </div>

      {/* Questions List with Spring Accordions */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          Loading authentic questions and ideal answers...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0B0F19] border border-white/[0.08] text-slate-500 text-xs">
          No matching questions found for "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#0B0F19] border-cyan-500/40 shadow-xl'
                    : 'bg-[#0B0F19]/60 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Header / Click to Expand */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {q.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        q.difficulty === 'mid' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {q.primary_competency?.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {/* Live Dynamic Weightage Badge */}
                      <span className="text-[10px] text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 font-mono font-semibold">
                        Priority: {q.live_priority_score || 1.0}
                      </span>

                      {q.real_world_occurrences > 0 && (
                        <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30">
                          🔥 Asked in {q.real_world_occurrences} drives
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      Q{idx + 1}. {q.question_text}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {/* 1-Click "Asked in My Drive (+1)" Button */}
                    <button
                      onClick={(e) => handleQuickUpvote(q.id, selectedCompany, e)}
                      title="Click if this question was asked in your real interview (+1 to priority)"
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition ${
                        upvotedIds.has(q.id)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <Zap size={11} className={upvotedIds.has(q.id) ? 'text-emerald-400' : 'text-amber-400'} />
                      <span>{upvotedIds.has(q.id) ? 'Reported (+1)' : 'Asked in Drive (+1)'}</span>
                    </button>

                    {onStartPractice && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartPractice(q, activeCompInfo);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-[11px] flex items-center gap-1 transition shadow-md"
                      >
                        <Play size={11} fill="currentColor" /> Practice
                      </motion.button>
                    )}
                    <button className="p-1 text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Content: Ideal Answer & Senior Tip with AnimatePresence */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="px-5 pb-5 pt-1 space-y-4 border-t border-white/[0.06] bg-black/20"
                    >
                      {/* Ideal Answer Box */}
                      <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] space-y-2 mt-3">
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <CheckCircle2 size={15} />
                          <span className="text-xs font-bold uppercase tracking-wider font-mono">
                            Ideal Answer & Technical Breakdown:
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                          {q.ideal_answer}
                        </p>
                      </div>

                      {/* Senior Placement Tip */}
                      {q.tip_text && (
                        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5">
                          <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-xs space-y-0.5">
                            <span className="font-bold text-amber-300">
                              Senior Tip from {q.senior_name} ({q.placed_company}):
                            </span>
                            <p className="text-slate-200 italic text-[11px] leading-relaxed">
                              "{q.tip_text}"
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL REPORT MODAL: "Report Real Campus Interview Question" */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F19] border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Report Real Campus Drive Question</h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Google Maps Live Driver Weightage System
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                {/* Target Company */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Company Interview Attended:</label>
                  <select
                    value={reportCompany}
                    onChange={(e) => setReportCompany(e.target.value)}
                    className="w-full bg-[#07090E] border border-white/[0.1] rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60 transition"
                  >
                    {POPULAR_COMPANIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                    ))}
                  </select>
                </div>

                {/* Mode Selector: New Question vs Existing */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Question Type:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReportMode('new')}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        reportMode === 'new'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                      }`}
                    >
                      + New Question Asked Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportMode('existing')}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        reportMode === 'existing'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                      }`}
                    >
                      Select From Existing Bank
                    </button>
                  </div>
                </div>

                {reportMode === 'new' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300 block">
                        Exact Question Text Asked by Interviewer:
                      </label>
                      <textarea
                        rows={3}
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="e.g. How does Redis handle cache invalidation and distributed lock TTLs?"
                        required
                        className="w-full bg-[#07090E] border border-white/[0.1] rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 leading-relaxed transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300 block">Category / Domain:</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Core Java, Distributed Systems, SQL, DSA"
                        className="w-full bg-[#07090E] border border-white/[0.1] rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60 transition"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 block">Select Question in Bank:</label>
                    <select
                      value={existingQuestionId}
                      onChange={(e) => setExistingQuestionId(e.target.value)}
                      required
                      className="w-full bg-[#07090E] border border-white/[0.1] rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60 transition"
                    >
                      <option value="">-- Choose question --</option>
                      {questions.map(q => (
                        <option key={q.id} value={q.id}>{q.question_text.slice(0, 80)}...</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Senior Alumni / Insider Tip */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Lightbulb size={13} />
                    <span>Insider Tip for Juniors (What did the interviewer focus on?):</span>
                  </label>
                  <textarea
                    rows={2}
                    value={seniorTip}
                    onChange={(e) => setSeniorTip(e.target.value)}
                    placeholder="e.g. The interviewer didn't care about textbook syntax; they wanted to see the B+ Tree depth trade-off calculation."
                    className="w-full bg-[#07090E] border border-amber-500/30 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 leading-relaxed transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Your Name / Placement Status:</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Rahul S. (Placed at TCS Digital)"
                    className="w-full bg-[#07090E] border border-white/[0.1] rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/60 transition"
                  />
                </div>

                {/* Formula Explanation Callout */}
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-[11px] text-cyan-200">
                  <b className="text-cyan-300">Google Maps Dynamic Priority Formula:</b>
                  <p className="text-slate-300 mt-1 font-mono text-[10px]">
                    Live Priority = 1.0 + (Campus Drive Reports × 1.5) + (Average Utility × 0.4)
                  </p>
                  <p className="text-slate-400 mt-1 text-[11px]">
                    Submitting this will raise this question's priority so it gets re-routed to other students preparing for {reportCompany.toUpperCase()}.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
                  >
                    {isSubmittingReport ? (
                      <span>Recording Drive Feedback...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit & Update Priority</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
