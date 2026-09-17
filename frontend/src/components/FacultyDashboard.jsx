import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, Award, CheckCircle2, RefreshCw, ArrowLeft, BarChart3, ShieldCheck } from 'lucide-react';

export default function FacultyDashboard({ user, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCohortData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/faculty/cohort-analytics');
      if (!res.ok) throw new Error('Failed to fetch cohort analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCohortData();
  }, []);

  const getCompetencyColor = (score) => {
    if (score < 2.5) return 'bg-rose-500 text-white';
    if (score < 3.8) return 'bg-amber-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Faculty & Placement Cell Cohort Analytics
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Campus Aggregates
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Department of Computer Science & Engineering • Academic Year 2025–2026
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchCohortData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition self-start md:self-auto text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Aggregating departmental interview records...</p>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto p-6 bg-rose-950/40 border border-rose-800 rounded-xl text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-rose-200 mb-4">{error}</p>
          <button 
            onClick={fetchCohortData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold tracking-wider">Registered Cohort</span>
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data.cohort_overview.registered_students}
              </div>
              <p className="text-xs text-slate-500 mt-1">Undergraduate candidates</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold tracking-wider">Completed Sessions</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data.cohort_overview.completed_sessions}
              </div>
              <p className="text-xs text-slate-500 mt-1">Full interview practice loops</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold tracking-wider">Evaluated Answers</span>
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {data.cohort_overview.total_answers_analyzed}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across 8 standardized competencies</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold tracking-wider">Mean Evolution Delta</span>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white text-emerald-400">
                +{data.cohort_overview.mean_answer_evolution_delta}
              </div>
              <p className="text-xs text-slate-500 mt-1">Longitudinal score improvement / attempt</p>
            </div>
          </div>

          {/* Departmental Bottleneck Alert */}
          {data.top_cohort_weaknesses && data.top_cohort_weaknesses.length > 0 && (
            <div className="p-6 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 mt-1 md:mt-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Priority Departmental Training Interventions</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    The platform identified persistent cohort-wide bottlenecks in{' '}
                    <strong className="text-amber-300 font-mono">
                      {data.top_cohort_weaknesses.map(w => w.replace('_', ' ')).join(', ')}
                    </strong>.
                    Placement cell workshops are recommended to focus on STAR storytelling and algorithmic complexity articulation.
                  </p>
                </div>
              </div>
              <div className="shrink-0 px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold uppercase">
                Action Required
              </div>
            </div>
          )}

          {/* Competency Breakdown Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Departmental Competency Distribution (0.0 to 5.0 Rubric)</span>
              <span className="text-xs text-slate-400 font-normal">Anonymized Cohort Mean</span>
            </h3>

            <div className="space-y-4">
              {data.competency_breakdown.map((item) => {
                const percentage = Math.min(100, Math.round((item.avg_score / 5.0) * 100));
                const cleanName = item.competency.replace('_', ' ').toUpperCase();
                return (
                  <div key={item.competency} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="font-semibold text-slate-200 tracking-wide">{cleanName}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">Sample: {item.sample_size} students</span>
                        <span className="text-base font-bold text-white">
                          {item.avg_score.toFixed(2)} <span className="text-xs text-slate-500">/ 5.0</span>
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          item.avg_score < 2.5 ? 'bg-rose-500' :
                          item.avg_score < 3.8 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Governance Notice */}
          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Ethical Compliance & Privacy:</strong> All faculty metrics are generated using pseudonymized cohort aggregation. Individual student transcripts and raw audio are protected in compliance with institutional data retention policies.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
