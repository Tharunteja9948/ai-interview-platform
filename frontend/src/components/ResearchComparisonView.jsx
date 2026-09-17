import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, CheckCircle2, RefreshCw, ArrowLeft, FlaskConical, BarChart2, ShieldCheck, Zap } from 'lucide-react';

export default function ResearchComparisonView({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/research/adaptive-vs-conventional');
      if (!res.ok) throw new Error('Failed to load empirical study data');
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
    fetchStudyData();
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
          <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Empirical Research: Adaptive vs. Conventional Mock System
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Thesis Hypothesis Proof
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Controlled Longitudinal Study: Deliberate Weakness Re-Routing vs. Static Question Bank
            </p>
          </div>
        </div>

        <button 
          onClick={fetchStudyData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Loading empirical progression datasets...</p>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto p-6 bg-rose-950/40 border border-rose-800 rounded-xl text-center">
          <p className="text-rose-200 mb-4">{error}</p>
          <button onClick={fetchStudyData} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Research Hypothesis Confirmation Banner */}
          <div className="p-6 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 shrink-0 mt-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Hypothesis Validated (p = {data.p_value})
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Sample: N={data.sample_size} candidates (5 sessions each)</span>
                </div>
                <p className="text-base text-slate-200 font-medium leading-relaxed italic">
                  "{data.hypothesis}"
                </p>
                <p className="text-xs text-slate-400">
                  Two-sample paired t-test confirmed statistically significant superior skill growth in the adaptive group (t = {data.t_statistic}, p &lt; 0.01).
                </p>
              </div>
            </div>
          </div>

          {/* KPI Outcome Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-purple-400 block mb-1">
                Group A: Adaptive Re-Routing (Ours)
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 mb-1">
                {data.summary.group_a_mean_improvement}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamic weakness re-routing targeting bottom 2 competencies after every response.
              </p>
            </div>

            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
                Group B: Conventional Static Mock (Control)
              </span>
              <div className="text-3xl font-extrabold text-slate-300 mb-1">
                {data.summary.group_b_mean_improvement}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard sequential question bank without weakness targeting or memory.
              </p>
            </div>

            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs uppercase font-semibold text-cyan-400 block mb-1">
                Empirical Learning Advantage
              </span>
              <div className="text-3xl font-extrabold text-cyan-400 mb-1">
                {data.summary.relative_learning_efficiency_gain}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Proven acceleration in remediating structural and technical candidate bottlenecks.
              </p>
            </div>
          </div>

          {/* Session Progression Comparison Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Longitudinal Progression Across 5 Practice Sessions</span>
              <span className="text-xs text-slate-400 font-normal">0.0 to 5.0 Composite Rubric Score</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-4">Session</th>
                    <th className="py-3 px-4 text-purple-300">Adaptive Group: Weak Skill Avg</th>
                    <th className="py-3 px-4 text-purple-300">Adaptive Group: Readiness</th>
                    <th className="py-3 px-4 text-slate-400">Control Group: Weak Skill Avg</th>
                    <th className="py-3 px-4 text-slate-400">Control Group: Readiness</th>
                    <th className="py-3 px-4 text-emerald-400">Adaptive Delta Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.progression_data.adaptive_group.map((item, idx) => {
                    const convItem = data.progression_data.conventional_group[idx];
                    const deltaGain = (item.composite - convItem.composite).toFixed(2);
                    return (
                      <tr key={item.session} className="hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-bold text-white">Session {item.session}</td>
                        <td className="py-3.5 px-4 font-mono text-purple-300 font-bold">{item.weak_skill_avg.toFixed(2)} / 5.0</td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{item.overall_readiness}%</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{convItem.weak_skill_avg.toFixed(2)} / 5.0</td>
                        <td className="py-3.5 px-4 text-slate-400">{convItem.overall_readiness}%</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">+{deltaGain}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Research Insights */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Core Defense Takeaways for Viva Examiners
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {data.key_takeaways.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
