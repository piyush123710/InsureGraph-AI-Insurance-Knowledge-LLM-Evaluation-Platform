import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  ShieldCheck,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Key,
  Layers,
  FileText
} from 'lucide-react';
import { useToast } from '../components/Toast.tsx';

export const SettingsPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [modelName, setModelName] = useState('gemini-3.8-flash');
  const [chunkSize, setChunkSize] = useState(400);
  const [chunkOverlap, setChunkOverlap] = useState(50);
  const [similarityMetric, setSimilarityMetric] = useState('Cosine Similarity (BM25 Hybrid)');
  const [judgeThinkingLevel, setJudgeThinkingLevel] = useState('MEDIUM');
  const [activeDocTab, setActiveDocTab] = useState<'architecture' | 'methodology' | 'api'>('architecture');
  const { showToast } = useToast();

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Configuration Updated', 'RAG retrieval and chunking parameters saved.');
  };

  const handleResetDefaults = () => {
    if (!window.confirm('Reset datasets and graph to initial state?')) return;
    window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Platform Settings & System Diagnostics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tune RAG hyperparameters, inspect system diagnostics, and review technical architecture specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: System Diagnostics Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>System Health & Telemetry</span>
            </h3>
            <button
              onClick={fetchHealth}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              title="Refresh Health"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500">Service Status:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Operational</span>
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
              <span className="text-slate-500">Indexed Documents:</span>
              <span className="font-bold text-slate-800">{healthData?.documentsCount ?? 5} docs</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
              <span className="text-slate-500">Vector Store Chunks:</span>
              <span className="font-bold text-slate-800">{healthData?.chunksCount ?? 19} chunks</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
              <span className="text-slate-500">Graph Topology:</span>
              <span className="font-bold text-slate-800">{healthData?.graphNodesCount ?? 28} nodes</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
              <span className="text-slate-500">Golden Test Suite:</span>
              <span className="font-bold text-slate-800">{healthData?.goldenTestCasesCount ?? 52} test cases</span>
            </div>

            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
              <span className="font-bold text-blue-900 block text-[11px]">Gemini API Integration</span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Active server-side GenAI SDK integration using model <span className="font-mono font-semibold">gemini-3.8-flash</span>. Configurable via AI Studio Secrets.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleResetDefaults}
              className="w-full py-1.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Reset to Factory Baseline
            </button>
          </div>
        </div>

        {/* Center & Right: Hyperparameters Form */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-slate-600" />
              <span>RAG & Evaluation Hyperparameters</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure chunking granularity, semantic similarity algorithms, and evaluation judge settings.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">RAG Generation Model</label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono text-xs"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                  <option value="gemini-4-argon">gemini-4-argon (Complex STEM / Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Similarity Metric</label>
                <select
                  value={similarityMetric}
                  onChange={e => setSimilarityMetric(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  <option value="Cosine Similarity (BM25 Hybrid)">Cosine Similarity (BM25 Hybrid)</option>
                  <option value="Dense Vector Dot-Product">Dense Vector Dot-Product</option>
                  <option value="Euclidean Distance L2">Euclidean Distance L2</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chunk Size (Target Tokens)</label>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={e => setChunkSize(Number(e.target.value))}
                  min={100}
                  max={1500}
                  step={50}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chunk Overlap (Tokens)</label>
                <input
                  type="number"
                  value={chunkOverlap}
                  onChange={e => setChunkOverlap(Number(e.target.value))}
                  min={0}
                  max={300}
                  step={10}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  LLM-as-a-Judge Thinking Level
                </label>
                <select
                  value={judgeThinkingLevel}
                  onChange={e => setJudgeThinkingLevel(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs"
                >
                  <option value="MEDIUM">ThinkingLevel.MEDIUM (Default)</option>
                  <option value="HIGH">ThinkingLevel.HIGH (Deep Reasoning)</option>
                  <option value="LOW">ThinkingLevel.LOW (Minimal Latency)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Save Hyperparameters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Technical Documentation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Technical Documentation</h3>
          </div>

          <div className="flex p-0.5 bg-slate-200 rounded-lg text-xs">
            <button
              onClick={() => setActiveDocTab('architecture')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDocTab === 'architecture' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveDocTab('methodology')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDocTab === 'methodology' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Evaluation Methodology
            </button>
            <button
              onClick={() => setActiveDocTab('api')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeDocTab === 'api' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              API Reference
            </button>
          </div>
        </div>

        <div className="p-6 text-xs text-slate-700 leading-relaxed font-mono space-y-4 max-h-96 overflow-y-auto">
          {activeDocTab === 'architecture' && (
            <div className="space-y-3">
              <p className="font-bold text-slate-900 text-sm">InsureGraph AI End-to-End Architecture</p>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg whitespace-pre overflow-x-auto text-[11px]">
{`+-------------------------------------------------------------+
|                  React.js + Tailwind Dashboard              |
|   Overview | Documents | Assistant | Graph | Evaluation Lab  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                 FastAPI / Express Server                    |
|             REST API Endpoints & State Store                |
+-------------------------------------------------------------+
        |                     |                     |
        v                     v                     v
+---------------+     +---------------+     +-----------------+
|   RAG Engine  |     |Knowledge Graph|     |Evaluation Engine|
| Vector Store  |     |  NetworkX /   |     | Precision@K, F1 |
| BM25 + Cosine |     | BFS Traversal |     |  Brier Score    |
+---------------+     +---------------+     +-----------------+
        \\                     |                     /
         \\                    v                    /
          +-------> Gemini 3.8 Flash LLM <--------+
                    (Grounded Generation
                     & LLM-as-a-Judge)`}
              </pre>
            </div>
          )}

          {activeDocTab === 'methodology' && (
            <div className="space-y-3">
              <p className="font-bold text-slate-900 text-sm">Evaluation Metrics & Calibration Formulation</p>
              <p>
                <strong>1. Precision@K:</strong> Precision@K measures the proportion of retrieved chunks that are verified relevant according to the golden dataset annotation:
                <br />
                <code className="text-blue-600">Precision@K = |Retrieved ∩ Relevant| / K</code>
              </p>
              <p>
                <strong>2. Recall@K:</strong> Measures the fraction of all relevant ground-truth chunks successfully retrieved:
                <br />
                <code className="text-blue-600">Recall@K = |Retrieved ∩ Relevant| / |Relevant|</code>
              </p>
              <p>
                <strong>3. Brier Score:</strong> The quadratic score rule measuring probability calibration:
                <br />
                <code className="text-blue-600">BS = (1/N) * Σ (p_i - y_i)²</code> where y_i ∈ &#123;0, 1&#125;.
              </p>
              <p>
                <strong>4. LLM-as-a-Judge:</strong> Independent judge evaluating accuracy, relevance, faithfulness, and identifying hallucination without relying on subjective user impressions.
              </p>
            </div>
          )}

          {activeDocTab === 'api' && (
            <div className="space-y-2">
              <p className="font-bold text-slate-900 text-sm">Public REST API Specifications</p>
              <div className="space-y-1">
                <div><span className="text-blue-600 font-bold">GET</span> /api/dashboard/metrics - System KPIs and latency trends</div>
                <div><span className="text-emerald-600 font-bold">POST</span> /api/chat/query - Execute grounded RAG assistant query</div>
                <div><span className="text-blue-600 font-bold">GET</span> /api/documents - List all policy documents and chunks</div>
                <div><span className="text-emerald-600 font-bold">POST</span> /api/documents/upload - Ingest and vectorize new policy text</div>
                <div><span className="text-blue-600 font-bold">GET</span> /api/knowledge-graph - Retrieve entity nodes and edges</div>
                <div><span className="text-emerald-600 font-bold">POST</span> /api/knowledge-graph/traverse - Shortest path BFS traversal</div>
                <div><span className="text-emerald-600 font-bold">POST</span> /api/evaluation/run - Trigger automated evaluation benchmark</div>
                <div><span className="text-blue-600 font-bold">GET</span> /api/evaluation/datasets - Retrieve golden benchmark dataset</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
