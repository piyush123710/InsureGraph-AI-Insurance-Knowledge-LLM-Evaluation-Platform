import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { ChatMessage } from '../types/index.ts';
import { useToast } from '../components/Toast.tsx';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topK, setTopK] = useState(3);
  const [expandedSourceMsgId, setExpandedSourceMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/chat/history');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery('');
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: 'web-session-01',
      role: 'user',
      content: q,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, topK })
      });

      if (res.ok) {
        const assistantMsg: ChatMessage = await res.json();
        setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);
      } else {
        const err = await res.json();
        showToast('error', 'Query Failed', err.error || 'Server error');
      }
    } catch (err: any) {
      showToast('error', 'Network Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear conversation history?')) return;
    try {
      await fetch('/api/chat/history', { method: 'DELETE' });
      setMessages([]);
      showToast('info', 'Chat Cleared', 'Conversation history reset.');
    } catch (err) {
      showToast('error', 'Failed to clear chat');
    }
  };

  const sampleQueries = [
    'What expenses are covered under the Premier Health Shield policy?',
    'What is the daily maximum allowance for Intensive Care Unit (ICU) charges?',
    'Does the commercial motor policy cover windshield damage without affecting NCD?',
    'What is the waiting period for pre-existing diseases under the health policy?',
    'What is the benefit under the 36 Critical Illness Rider if diagnosed with cancer?'
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
      {/* Sub-header Controls */}
      <div className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Grounded Policy Assistant (RAG)</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Vector Model: Dense Embeddings (Cosine Sim)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Top-K Chunks:</span>
            <select
              value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-mono text-slate-800"
            >
              <option value={1}>K = 1</option>
              <option value={3}>K = 3</option>
              <option value={5}>K = 5</option>
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ask InsureGraph Policy Intelligence
              </h2>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Query terms, conditions, sub-limits, deductibles, exclusions, and claims processes. Responses cite exact clauses, sections, and pages.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-2 pt-4 text-left">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                Suggested Policy Queries:
              </span>
              {sampleQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-xs text-slate-800 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span>{q}</span>
                  <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs space-y-3 leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white font-medium ml-12'
                    : 'bg-white border border-slate-200/90 text-slate-800 mr-12'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Assistant Metadata & Source Citations */}
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {/* Confidence score indicator */}
                        {msg.confidence !== undefined && (
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums ${
                              msg.confidence >= 0.8
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : msg.confidence >= 0.5
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            Confidence: {(msg.confidence * 100).toFixed(0)}%
                          </span>
                        )}

                        {/* Latency info */}
                        {msg.retrievalLatencyMs !== undefined && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {msg.retrievalLatencyMs}ms ret + {msg.generationLatencyMs || 0}ms gen
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setExpandedSourceMsgId(expandedSourceMsgId === msg.id ? null : msg.id)
                        }
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <span>{msg.sources.length} Cited Sources</span>
                        {expandedSourceMsgId === msg.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Low Confidence Warning */}
                    {msg.confidence !== undefined && msg.confidence < 0.6 && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Low retrieval confidence detected. Policy terms may not explicitly cover this scenario; please cross-reference the full policy wording.
                        </span>
                      </div>
                    )}

                    {/* Expanded Source Chunks */}
                    {expandedSourceMsgId === msg.id && (
                      <div className="space-y-2 pt-2">
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-800">
                              <span className="truncate max-w-xs">{src.document}</span>
                              <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1 rounded">
                                {(src.similarity * 100).toFixed(1)}% match
                              </span>
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              {src.section} · Page {src.page} · {src.clause}
                            </div>
                            <p className="text-slate-600 italic font-mono text-[10px] bg-white p-1.5 rounded border border-slate-100">
                              "{src.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span className="font-medium text-slate-700">
                  Retrieving chunks & generating grounded answer...
                </span>
              </div>
              <div className="h-2 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask a policy question (e.g. 'What is the waiting period for critical illness?')..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-900 shadow-2xs transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
