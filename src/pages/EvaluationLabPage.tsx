import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Download,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  TrendingDown,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { EvaluationRun, EvaluationItemResult } from '../types/index.ts';
import { useToast } from '../components/Toast.tsx';

export const EvaluationLabPage: React.FC = () => {
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [activeRun, setActiveRun] = useState<EvaluationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [evalProgress, setEvalProgress] = useState(0);

  // Configuration options
  const [kValue, setKValue] = useState<number>(3);
  const [sampleSize, setSampleSize] = useState<'all' | '15' | '30'>('15');

  // Filter & Search inside results
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/evaluation/history');
      if (res.ok) {
        const data: EvaluationRun[] = await res.json();
        setRuns(data);
        if (data.length > 0 && !activeRun) {
          setActiveRun(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load evaluation history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const triggerEvaluation = async () => {
    try {
      setIsRunningEval(true);
      setEvalProgress(10);
      showToast('info', 'Evaluation Started', `Evaluating test cases with K=${kValue}...`);

      const progressInterval = setInterval(() => {
        setEvalProgress(p => (p < 85 ? p + 15 : p));
      }, 500);

      // Determine test cases to evaluate
      const datasetsRes = await fetch('/api/evaluation/datasets');
      const datasetsData = await datasetsRes.json();
      const allCases = datasetsData.testCases || [];
      const testCaseIds =
        sampleSize === 'all'
          ? allCases.map((c: any) => c.id)
          : allCases.slice(0, parseInt(sampleSize, 10)).map((c: any) => c.id);

      const res = await fetch('/api/evaluation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds,
          kValue,
          datasetName: `Benchmark Run (${sampleSize === 'all' ? 'All' : sampleSize} Cases, K=${kValue})`
        })
      });

      clearInterval(progressInterval);
      setEvalProgress(100);

      if (res.ok) {
        const newRun: EvaluationRun = await res.json();
        setActiveRun(newRun);
        setRuns(prev => [newRun, ...prev]);
        showToast(
          'success',
          'Evaluation Completed',
          `Evaluated ${newRun.totalCases} cases · F1: ${newRun.metrics.f1Score} · Pass Rate: ${newRun.metrics.passRate}%`
        );
      } else {
        const err = await res.json();
        showToast('error', 'Evaluation Failed', err.error || 'Server error');
      }
    } catch (err: any) {
      showToast('error', 'Execution Error', err.message);
    } finally {
      setIsRunningEval(false);
      setTimeout(() => setEvalProgress(0), 1000);
    }
  };

  const exportReport = (format: 'json' | 'csv') => {
    if (!activeRun) return;

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeRun, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `evaluation_report_${activeRun.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', 'Exported JSON', 'Evaluation report downloaded.');
    } else {
      const headers = [
        'Test Case ID',
        'Question',
        'Expected Answer',
        'Actual Answer',
        'Precision@K',
        'Recall@K',
        'F1 Score',
        'Faithfulness',
        'Relevance',
        'Confidence',
        'Correctness',
        'Passed'
      ];
      const rows = activeRun.results.map(r => [
        `"${r.testCaseId}"`,
        `"${r.question.replace(/"/g, '""')}"`,
        `"${r.expectedAnswer.replace(/"/g, '""')}"`,
        `"${r.actualAnswer.replace(/"/g, '""')}"`,
        r.precisionAtK,
        r.recallAtK,
        r.f1Score,
        r.faithfulness,
        r.answerRelevance,
        r.predictedConfidence,
        r.actualCorrectness,
        r.passed
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `evaluation_report_${activeRun.id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Exported CSV', 'Evaluation metrics CSV downloaded.');
    }
  };

  const filteredResults = activeRun?.results.filter(r => {
    const matchStatus =
      statusFilter === 'all' ? true : statusFilter === 'passed' ? r.passed : !r.passed;
    const matchQuery =
      r.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.actualAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.expectedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  }) || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            LLM Evaluation Lab & Benchmarks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Independent evaluation harness for RAG retrieval quality, LLM-as-a-Judge scoring, and Brier calibration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Config Controls */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">K:</span>
            <select
              value={kValue}
              onChange={e => setKValue(Number(e.target.value))}
              className="bg-transparent font-mono text-slate-800 focus:outline-none"
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500 font-medium">Cases:</span>
            <select
              value={sampleSize}
              onChange={e => setSampleSize(e.target.value as any)}
              className="bg-transparent font-mono text-slate-800 focus:outline-none"
            >
              <option value="15">15 Cases</option>
              <option value="30">30 Cases</option>
              <option value="all">All 52</option>
            </select>
          </div>

          <button
            onClick={triggerEvaluation}
            disabled={isRunningEval}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningEval ? 'Executing...' : 'Run Evaluation'}</span>
          </button>

          <button
            onClick={() => exportReport('csv')}
            disabled={!activeRun}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => exportReport('json')}
            disabled={!activeRun}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Progress Bar when running */}
      {isRunningEval && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
            <span>Evaluating RAG Retrieval, Context Precision & LLM-as-a-Judge...</span>
            <span className="font-mono">{evalProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${evalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Evaluation Runs Selector strip */}
      {runs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Run History:</span>
          {runs.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRun(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                activeRun?.id === r.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono font-semibold">{r.id.replace('eval-run-', 'Run-')}</span>
              <span className="ml-1.5 opacity-70">
                (F1: {r.metrics.f1Score} · {r.metrics.passRate}%)
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Primary Metrics Grid (8 Core Evaluation Metrics) */}
      {activeRun && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Precision@K</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-slate-900">
                {(activeRun.metrics.precisionAtK * 100).toFixed(1)}%
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Relevant / Retrieved</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Recall@K</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-slate-900">
                {(activeRun.metrics.recallAtK * 100).toFixed(1)}%
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Retrieved / Relevant</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-blue-600">F1-Score</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-blue-600">
                {activeRun.metrics.f1Score}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Harmonic Mean</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-emerald-600">Faithfulness</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-emerald-600">
                {activeRun.metrics.faithfulness}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Context Grounding</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Answer Relevance</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-slate-900">
                {activeRun.metrics.answerRelevance}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Semantic Fit</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Context Prec.</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-slate-900">
                {activeRun.metrics.contextPrecision}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Rank Position</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-amber-600">Brier Score</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-amber-600">
                {activeRun.metrics.brierScore}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Lower = Better</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-purple-600">Pass Rate</span>
            <div className="mt-2">
              <span className="text-xl font-bold font-mono text-purple-600">
                {activeRun.metrics.passRate}%
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">SLA Threshold</p>
            </div>
          </div>
        </div>
      )}

      {/* Deep Calibration Analysis & Reliability Diagram */}
      {activeRun && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reliability Diagram */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confidence Calibration Analysis</h3>
                <p className="text-xs text-slate-500">
                  Reliability curve: Predicted confidence vs empirical correctness rate
                </p>
              </div>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                Brier: {activeRun.metrics.brierScore}
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeRun.calibration.bins}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="confidenceRange" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${((Number(val) || 0) * 100).toFixed(1)}%`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="avgConfidence" name="Predicted Confidence" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgAccuracy" name="Actual Accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-rose-600">Overconfident Cases:</span>
                <span className="font-mono tabular-nums">{activeRun.calibration.overconfidenceCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-blue-600">Underconfident Cases:</span>
                <span className="font-mono tabular-nums">{activeRun.calibration.underconfidenceCount}</span>
              </span>
            </div>
          </div>

          {/* Evaluation Harness Methodology & Guidelines Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evaluation Engine Methodology</h3>
              <p className="text-xs text-slate-500">Mathematical formulation of RAG evaluation harness</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  Brier Score Formula:
                </span>
                <p className="font-mono text-slate-600 text-[11px]">
                  BS = (1/N) * Σ (Predicted_Confidence_i - Actual_Correctness_i)²
                </p>
                <p className="text-slate-500 text-[10px]">
                  Calibrated models achieve BS close to 0.00; penalizes both overconfidence and timid guesses.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  LLM-as-a-Judge Protocol:
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Uses Gemini 3.8 Flash with structured schema evaluation. Evaluates factual alignment, context support, answers completeness, and detects policy clause hallucinations.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  Retrieval F1 Score:
                </span>
                <p className="font-mono text-slate-600 text-[11px]">
                  F1@K = 2 * (Precision@K * Recall@K) / (Precision@K + Recall@K)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Evaluation Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-slate-900 whitespace-nowrap">
              Test Case Results ({filteredResults.length} / {activeRun?.totalCases || 0}):
            </span>
            <div className="flex p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('passed')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'passed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Passed
              </button>
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'failed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Failed
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search question, expected or actual text..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Question</th>
                <th className="py-2.5 px-3">Precision@K</th>
                <th className="py-2.5 px-3">Recall@K</th>
                <th className="py-2.5 px-3">Faithfulness</th>
                <th className="py-2.5 px-3">LLM Judge Acc.</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No test cases match filter.
                  </td>
                </tr>
              ) : (
                filteredResults.map(item => (
                  <React.Fragment key={item.testCaseId}>
                    <tr
                      onClick={() =>
                        setExpandedCaseId(expandedCaseId === item.testCaseId ? null : item.testCaseId)
                      }
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        {item.passed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Passed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {item.question}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                        {(item.precisionAtK * 100).toFixed(0)}%
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                        {(item.recallAtK * 100).toFixed(0)}%
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-emerald-600 font-medium">
                        {item.faithfulness}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-blue-600 font-medium">
                        {item.llmJudge.accuracy}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                        {(item.predictedConfidence * 100).toFixed(0)}%
                      </td>

                      <td className="py-3 px-3 text-right">
                        {expandedCaseId === item.testCaseId ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail Accordion */}
                    {expandedCaseId === item.testCaseId && (
                      <tr className="bg-slate-50/90 border-y border-slate-200">
                        <td colSpan={8} className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ground Truth vs Actual */}
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                Ground Truth Expected Answer:
                              </span>
                              <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-800 text-xs leading-relaxed">
                                {item.expectedAnswer}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                RAG Generated Answer:
                              </span>
                              <div className="p-2.5 bg-white border border-blue-200 rounded text-slate-800 text-xs leading-relaxed">
                                {item.actualAnswer}
                              </div>
                            </div>
                          </div>

                          {/* LLM Judge Reasoning */}
                          <div className="p-3 bg-white border border-slate-200 rounded space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-900">
                                LLM-as-a-Judge Evaluation:
                              </span>
                              <span
                                className={`font-mono font-semibold ${
                                  item.llmJudge.hallucinationDetected
                                    ? 'text-rose-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {item.llmJudge.hallucinationDetected
                                  ? 'Hallucination Detected'
                                  : 'No Hallucination'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 italic">
                              "{item.llmJudge.reasoning}"
                            </p>
                          </div>

                          {/* Chunks Alignment */}
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                            <span>Retrieved Chunks: [{item.retrievedChunks.join(', ')}]</span>
                            <span>Expected Chunks: [{item.expectedChunks.join(', ')}]</span>
                            <span>Latency: {item.latencyMs}ms</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
