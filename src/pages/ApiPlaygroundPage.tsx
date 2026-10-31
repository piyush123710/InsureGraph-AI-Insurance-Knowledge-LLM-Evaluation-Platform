import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Clock,
  Code2,
  FileJson,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../components/Toast.tsx';

interface ApiEndpointOption {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  description: string;
  defaultBody?: any;
}

const ENDPOINTS: ApiEndpointOption[] = [
  {
    method: 'GET',
    path: '/api/dashboard/metrics',
    description: 'Retrieve real-time telemetry metrics, query volumes, and benchmark averages.'
  },
  {
    method: 'POST',
    path: '/api/chat/query',
    description: 'Execute grounded policy RAG retrieval with source citation synthesis.',
    defaultBody: {
      query: 'What is the daily maximum allowance for Intensive Care Unit (ICU) charges?',
      topK: 3
    }
  },
  {
    method: 'GET',
    path: '/api/documents',
    description: 'List all indexed policy documents with chunk counts and token statistics.'
  },
  {
    method: 'GET',
    path: '/api/knowledge-graph',
    description: 'Fetch multi-relational graph topology, degree centralities, and entity distributions.'
  },
  {
    method: 'POST',
    path: '/api/knowledge-graph/traverse',
    description: 'Find shortest path graph connection between two insurance entities.',
    defaultBody: {
      sourceId: 'cust-eleanor',
      targetId: 'med-appendectomy'
    }
  },
  {
    method: 'POST',
    path: '/api/knowledge-graph/search',
    description: 'Search graph entities with fuzzy matching and category filtering.',
    defaultBody: {
      keyword: 'appendectomy',
      typeFilter: 'all'
    }
  },
  {
    method: 'GET',
    path: '/api/evaluation/datasets',
    description: 'Retrieve all 52 golden test cases and dataset distribution metrics.'
  },
  {
    method: 'POST',
    path: '/api/evaluation/run',
    description: 'Trigger full or partial evaluation run with Precision@K, Recall@K, and LLM Judge.',
    defaultBody: {
      kValue: 3,
      datasetName: 'API Playground Evaluation Test'
    }
  },
  {
    method: 'GET',
    path: '/api/health',
    description: 'System health check, active memory collections, and Gemini configuration status.'
  }
];

export const ApiPlaygroundPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointOption>(ENDPOINTS[1]);
  const [requestBodyText, setRequestBodyText] = useState(
    JSON.stringify(ENDPOINTS[1].defaultBody, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [responseBody, setResponseBody] = useState<any>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleSelectEndpoint = (ep: ApiEndpointOption) => {
    setSelectedEndpoint(ep);
    setRequestBodyText(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseStatus(null);
    setResponseBody(null);
    setResponseLatency(null);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    const start = Date.now();
    try {
      let bodyData: any = undefined;
      if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBodyText.trim()) {
        bodyData = JSON.parse(requestBodyText);
      }

      const res = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: bodyData ? JSON.stringify(bodyData) : undefined
      });

      const latency = Date.now() - start;
      setResponseLatency(latency);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseBody(json);
      showToast('success', `${res.status} ${res.statusText}`, `${latency}ms response latency`);
    } catch (err: any) {
      setResponseLatency(Date.now() - start);
      setResponseStatus(500);
      setResponseBody({ error: err.message || 'Request execution error' });
      showToast('error', 'API Request Failed', err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCurl = () => {
    let curl = `curl -X ${selectedEndpoint.method} "http://localhost:3000${selectedEndpoint.path}"`;
    if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBodyText.trim()) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBodyText.replace(/'/g, "\\'")}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'cURL Copied', 'Shell command copied to clipboard.');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Interactive REST API Playground
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Execute and inspect backend REST APIs for RAG queries, document ingestion, knowledge graph traversal, and evaluation benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoint selector */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1 mb-2">
            Available Endpoints:
          </span>

          <div className="space-y-1.5">
            {ENDPOINTS.map(ep => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 text-slate-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-700'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px] truncate">{ep.path}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{ep.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Request & Response Workbench */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Header Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold text-xs px-2.5 py-1 rounded ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-blue-100 text-blue-700'
                      : selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {selectedEndpoint.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyCurl}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy cURL</span>
                </button>

                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">{selectedEndpoint.description}</p>

            {/* Request Body Editor (if POST/PUT) */}
            {['POST', 'PUT'].includes(selectedEndpoint.method) && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  JSON Request Payload:
                </label>
                <textarea
                  rows={6}
                  value={requestBodyText}
                  onChange={e => setRequestBodyText(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-slate-500" />
                <span>Response Payload</span>
              </span>

              {responseStatus !== null && (
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>

                  {responseLatency !== null && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {responseLatency}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-96">
              {responseBody ? (
                <pre className="text-emerald-400">
                  {JSON.stringify(responseBody, null, 2)}
                </pre>
              ) : (
                <div className="py-12 text-center text-slate-500 italic">
                  Click "Send Request" to invoke the endpoint and inspect structured JSON results.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
