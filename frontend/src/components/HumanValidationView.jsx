import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, ArrowLeft, RefreshCw, BarChart3, Users, Scale } from 'lucide-react';

export default function HumanValidationView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchValidationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/research/human-validation');
      if (!res.ok) throw new Error('Failed to load human validation dataset');
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
    fetchValidationData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Back to Studio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Ground-Truth Human Faculty Validation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                Inter-Rater Reliability
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Blind Evaluation Study: AI Standardized Rubric vs. 3 Senior CSE Faculty Interviewers
            </p>
          </div>
        </div>

        <button 
          onClick={fetchValidationData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Loading ground truth agreement metrics...</p>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto p-6 bg-rose-950/40 border border-rose-800 rounded-xl text-center">
          <p className="text-rose-200 mb-4">{error}</p>
          <button onClick={fetchValidationData} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Pearson Correlation (r)</span>
              <div className="text-3xl font-extrabold text-emerald-400">
                {data.composite_pearson_r}
              </div>
              <p className="text-xs text-slate-500 mt-1">High statistical agreement (&gt; 0.90)</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Mean Absolute Error (MAE)</span>
              <div className="text-3xl font-extrabold text-cyan-400">
                {data.composite_mae}
              </div>
              <p className="text-xs text-slate-500 mt-1">On a 0.0 to 5.0 discrete scale</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Cohen's Kappa (κ)</span>
              <div className="text-3xl font-extrabold text-indigo-400">
                {data.composite_cohens_kappa}
              </div>
              <p className="text-xs text-slate-500 mt-1">Substantial inter-rater reliability</p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Benchmark Sample</span>
              <div className="text-3xl font-extrabold text-amber-400">
                {data.sample_answers_evaluated} Answers
              </div>
              <p className="text-xs text-slate-500 mt-1">Rated blindly by {data.panel_size} senior faculty</p>
            </div>
          </div>

          {/* 8 Standardized Dimensions Agreement Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Dimension-by-Dimension Faculty Agreement Matrix</span>
              <span className="text-xs text-slate-400 font-normal">0.0 to 5.0 Discrete Anchors</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-4">Competency Dimension</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Faculty Mean</th>
                    <th className="py-3 px-4">AI Score Mean</th>
                    <th className="py-3 px-4">MAE</th>
                    <th className="py-3 px-4 text-emerald-400">Pearson r</th>
                    <th className="py-3 px-4">Kappa (κ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.dimensions.map((dim) => (
                    <tr key={dim.dimension} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-white">{dim.dimension}</td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          dim.category === 'Content' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {dim.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{dim.human_mean.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{dim.ai_mean.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400">{dim.mae.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{dim.pearson_r.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{dim.kappa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Blind-Scored Benchmark Comparisons */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Sample Blind-Rated Candidate Answers (Faculty Panel vs. AI Rubric)
            </h3>

            <div className="space-y-4">
              {data.sample_items.map((item) => (
                <div key={item.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-white">{item.question}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                        Faculty Avg: <strong className="text-white">{item.faculty_avg.toFixed(2)}</strong>
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AI Score: <strong className="text-emerald-200">{item.ai_score.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{item.sample_snippet}"</p>
                  <div className="text-[11px] text-slate-500 flex gap-4 pt-1">
                    <span>Faculty Panel Ratings: [{item.faculty_scores.join(', ')}]</span>
                    <span className="text-emerald-400 font-mono">Error Delta: {item.agreement_error.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
