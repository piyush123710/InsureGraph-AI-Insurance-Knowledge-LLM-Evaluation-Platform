import React, { useEffect, useState } from 'react';
import {
  FileText,
  Bot,
  Gauge,
  Clock,
  CheckCircle2,
  FlaskConical,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { DashboardMetrics } from '../types/index.ts';
import { NavTab } from '../components/Sidebar.tsx';

interface OverviewPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Documents',
      value: metrics?.totalDocuments ?? 5,
      detail: `${metrics?.totalProcessedDocuments ?? 5} fully processed`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'AI Queries Handled',
      value: metrics?.totalAiQueries ?? 147,
      detail: 'RAG context grounded',
      icon: Bot,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      title: 'Avg Latency',
      value: `${metrics?.averageResponseTimeMs ?? 418}ms`,
      detail: 'Vector + LLM inference',
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Retrieval Precision',
      value: `${((metrics?.averageRetrievalPrecision ?? 0.92) * 100).toFixed(0)}%`,
      detail: 'Precision@K benchmark',
      icon: Gauge,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Faithfulness Score',
      value: `${((metrics?.averageFaithfulnessScore ?? 0.94) * 100).toFixed(0)}%`,
      detail: 'Zero hallucination target',
      icon: CheckCircle2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50'
    },
    {
      title: 'Evaluation Runs',
      value: metrics?.totalEvaluationRuns ?? 2,
      detail: '52 test case suite',
      icon: FlaskConical,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Enterprise Insurance Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time RAG retrieval performance, knowledge graph connectivity, and LLM evaluation benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMetrics}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={() => onNavigate('evaluation')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Run Benchmark</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{kpi.title}</span>
                <div className={`p-1.5 rounded-md ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                  {kpi.value}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{kpi.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: RAG Benchmark Metrics vs Baseline & Target */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">RAG Performance vs Target</h2>
              <p className="text-xs text-slate-500">Benchmark comparison of core RAG retrieval and generation metrics</p>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              K = 3
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics?.ragPerformanceTrends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${((Number(val) || 0) * 100).toFixed(1)}%`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="baseline" name="Baseline (Unranked)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="InsureGraph RAG" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Production SLA" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Query Volume & Confidence Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Weekly Query Throughput</h2>
              <p className="text-xs text-slate-500">Daily policy inquiries and average confidence calibration</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this week</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics?.queryVolumeTrends || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [val ?? 0, 'Queries']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#queryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity & Recent Evaluation Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Evaluation Runs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Evaluation Runs</h2>
              <p className="text-xs text-slate-500">Benchmark results across golden insurance test datasets</p>
            </div>
            <button
              onClick={() => onNavigate('evaluation')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Runs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Run Identifier</th>
                  <th className="py-2.5 px-3">Precision@K</th>
                  <th className="py-2.5 px-3">Recall@K</th>
                  <th className="py-2.5 px-3">F1 Score</th>
                  <th className="py-2.5 px-3">Faithfulness</th>
                  <th className="py-2.5 px-3 text-right">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics?.recentEvaluationRuns.map(run => (
                  <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-700">
                      <span className="font-semibold text-slate-900">{run.id}</span>
                      <span className="block text-[10px] text-slate-400">
                        {new Date(run.runAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                      {(run.precisionAtK * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                      {(run.recallAtK * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-blue-600">
                      {(run.f1Score * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-emerald-600 font-medium">
                      {(run.faithfulness * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right font-bold text-slate-900">
                      {run.passRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): System Modules Quick Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Architecture Navigation</h2>
            <p className="text-xs text-slate-500 mb-4">Direct access to core platform services</p>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('assistant')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">RAG Assistant</h3>
                    <p className="text-[11px] text-slate-500">Query policies with source citations</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('graph')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-md">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Knowledge Graph</h3>
                    <p className="text-[11px] text-slate-500">Multi-relational graph traversal</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('datasets')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-md">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Golden Datasets</h3>
                    <p className="text-[11px] text-slate-500">52 insurance test cases & ground truth</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
            <span>LLM-as-a-Judge:</span> <span className="text-slate-800 font-medium">Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
