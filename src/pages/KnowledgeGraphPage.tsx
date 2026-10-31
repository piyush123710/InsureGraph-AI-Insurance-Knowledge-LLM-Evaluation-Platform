import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Network,
  Search,
  Filter,
  Route,
  Info,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { GraphEntity, GraphRelationship } from '../types/index.ts';
import { GraphTraversalPath } from '../../server/services/graph.ts';
import { useToast } from '../components/Toast.tsx';

// Distinct colors for each ontology entity type
const ENTITY_CONFIG: Record<
  string,
  { bg: string; border: string; text: string; fill: string }
> = {
  Customer: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', fill: '#f59e0b' },
  'Insurance Policy': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', fill: '#3b82f6' },
  'Insurance Provider': { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800', fill: '#a855f7' },
  Coverage: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', fill: '#10b981' },
  Claim: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-800', fill: '#f43f5e' },
  'Medical Treatment': { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800', fill: '#6366f1' },
  Vehicle: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-800', fill: '#06b6d4' },
  Premium: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-800', fill: '#64748b' },
  Exclusion: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', fill: '#ef4444' }
};

export const KnowledgeGraphPage: React.FC = () => {
  const [nodes, setNodes] = useState<GraphEntity[]>([]);
  const [edges, setEdges] = useState<GraphRelationship[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [entityDetails, setEntityDetails] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  // Traversal path state
  const [sourceEntityId, setSourceEntityId] = useState<string>('cust-eleanor');
  const [targetEntityId, setTargetEntityId] = useState<string>('med-appendectomy');
  const [traversalResult, setTraversalResult] = useState<GraphTraversalPath | null>(null);
  const [isTraversing, setIsTraversing] = useState(false);

  // Canvas zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'canvas' | 'traversal'>('canvas');
  const { showToast } = useToast();

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/knowledge-graph');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes);
        setEdges(data.edges);
        setStats(data.stats);
        if (data.nodes.length > 0 && !selectedEntityId) {
          handleSelectNode(data.nodes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load graph:', err);
      showToast('error', 'Failed to load knowledge graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleSelectNode = async (entityId: string) => {
    setSelectedEntityId(entityId);
    try {
      const res = await fetch(`/api/knowledge-graph/entity/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setEntityDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTraverse = async () => {
    if (!sourceEntityId || !targetEntityId) return;
    try {
      setIsTraversing(true);
      const res = await fetch('/api/knowledge-graph/traverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: sourceEntityId, targetId: targetEntityId })
      });
      if (res.ok) {
        const data: GraphTraversalPath = await res.json();
        setTraversalResult(data);
        showToast('success', 'Path Found', `Traversed ${data.length} graph hops.`);
      } else {
        const err = await res.json();
        setTraversalResult(null);
        showToast('error', 'No Path', err.error || 'No route found');
      }
    } catch (err: any) {
      showToast('error', 'Traversal error', err.message);
    } finally {
      setIsTraversing(false);
    }
  };

  // Node layout coordinates (circular force arrangement)
  const nodePositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>();
    const centerX = 450;
    const centerY = 350;

    // Arrange nodes grouped in concentric circles based on ontology type
    const types = Object.keys(ENTITY_CONFIG);
    nodes.forEach((node, i) => {
      const typeIndex = types.indexOf(node.type);
      const radius = 130 + (typeIndex % 3) * 90;
      const angle = (i / nodes.length) * 2 * Math.PI + (typeIndex * 0.4);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      posMap.set(node.id, { x, y });
    });
    return posMap;
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      const matchType = selectedTypeFilter === 'all' || n.type === selectedTypeFilter;
      const matchQuery =
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchQuery;
    });
  }, [nodes, selectedTypeFilter, searchQuery]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
      {/* Top Controls Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Network className="w-4 h-4 text-purple-600" />
            <span>Insurance Knowledge Graph</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500 tabular-nums">
            {stats?.totalNodes || 0} Entities · {stats?.totalEdges || 0} Relationships · Density: {stats?.density || 0}
          </span>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'canvas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Canvas
            </button>
            <button
              onClick={() => setActiveTab('traversal')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'traversal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Path Traversal (BFS)
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center Canvas Area */}
        <div className="flex-1 flex flex-col relative bg-slate-100/60 overflow-hidden">
          {activeTab === 'canvas' ? (
            <>
              {/* Canvas Search & Filter Floating Bar */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 max-w-xl">
                <div className="relative w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search graph entities..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={selectedTypeFilter}
                  onChange={e => setSelectedTypeFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-2xs"
                >
                  <option value="all">All Entity Types</option>
                  {Object.keys(ENTITY_CONFIG).map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs p-0.5">
                  <button
                    onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setZoom(1);
                      setPan({ x: 0, y: 0 });
                    }}
                    className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                    title="Reset Canvas"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive SVG Graph Network */}
              <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 900 700"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out'
                  }}
                >
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                    </marker>
                    <marker
                      id="arrow-active"
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                    </marker>
                  </defs>

                  {/* Edges */}
                  {edges.map(edge => {
                    const srcPos = nodePositions.get(edge.source);
                    const tgtPos = nodePositions.get(edge.target);
                    if (!srcPos || !tgtPos) return null;

                    const isConnectedToSelected =
                      selectedEntityId === edge.source || selectedEntityId === edge.target;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={srcPos.x}
                          y1={srcPos.y}
                          x2={tgtPos.x}
                          y2={tgtPos.y}
                          stroke={isConnectedToSelected ? '#2563eb' : '#cbd5e1'}
                          strokeWidth={isConnectedToSelected ? 2.5 : 1.2}
                          strokeDasharray={isConnectedToSelected ? 'none' : '4 2'}
                          markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map(node => {
                    const pos = nodePositions.get(node.id);
                    if (!pos) return null;
                    const isSelected = selectedEntityId === node.id;
                    const isHighlighted = filteredNodes.some(n => n.id === node.id);
                    const config = ENTITY_CONFIG[node.type] || ENTITY_CONFIG['Customer'];

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => handleSelectNode(node.id)}
                        className="cursor-pointer group"
                        opacity={isHighlighted ? 1 : 0.25}
                      >
                        {/* Glow halo on selected */}
                        {isSelected && (
                          <circle r="24" fill={config.fill} opacity="0.2" className="animate-pulse" />
                        )}

                        <circle
                          r={isSelected ? 16 : 13}
                          fill={config.fill}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-150"
                        />

                        {/* Label */}
                        <text
                          y={26}
                          textAnchor="middle"
                          className={`text-[10px] font-semibold select-none ${
                            isSelected ? 'fill-blue-900 font-bold' : 'fill-slate-700'
                          }`}
                        >
                          {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                        </text>
                        <text
                          y={37}
                          textAnchor="middle"
                          className="text-[8px] fill-slate-400 select-none font-mono"
                        >
                          {node.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </>
          ) : (
            /* Path Traversal View */
            <div className="p-6 max-w-2xl mx-auto w-full space-y-6 overflow-y-auto">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    NetworkX Graph Traversal & Shortest Path
                  </h3>
                  <p className="text-xs text-slate-500">
                    Find shortest multi-hop relationships between any two insurance entities using Breadth-First Search.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Source Entity</label>
                    <select
                      value={sourceEntityId}
                      onChange={e => setSourceEntityId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Entity</label>
                    <select
                      value={targetEntityId}
                      onChange={e => setTargetEntityId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleTraverse}
                  disabled={isTraversing}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2"
                >
                  <Route className="w-4 h-4" />
                  <span>{isTraversing ? 'Computing BFS Path...' : 'Traverse Shortest Path'}</span>
                </button>
              </div>

              {traversalResult && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Discovered Path ({traversalResult.length} Hops)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                      Path Length: {traversalResult.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {traversalResult.nodes.map((n, idx) => {
                      const rel = traversalResult.relationships[idx];
                      return (
                        <div key={n.id} className="space-y-2">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{n.name}</span>
                              <span className="block text-[11px] text-slate-500">{n.type}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400">{n.id}</span>
                          </div>

                          {rel && (
                            <div className="flex items-center justify-center gap-2 py-1 text-[11px] font-mono text-blue-600 font-semibold">
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>{rel.type}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Selected Entity Details & Neighborhood Inspector */}
        <div className="w-80 bg-white border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shrink-0 text-xs">
          {entityDetails?.entity ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {entityDetails.entity.type}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Degree: {entityDetails.entity.degree || 0}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {entityDetails.entity.name}
                </h3>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {entityDetails.entity.description}
                </p>
              </div>

              {/* Properties */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Entity Attributes:
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
                  {Object.entries(entityDetails.entity.properties || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-700">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-medium truncate max-w-[140px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Neighborhood */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Connected Entities ({entityDetails.neighbors.length}):
                </span>
                <div className="space-y-2">
                  {entityDetails.neighbors.map((n: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSelectNode(n.connectedEntity.id)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800 truncate max-w-[180px]">
                          {n.connectedEntity.name}
                        </div>
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                          {n.relationship.type} ({n.direction})
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Select an entity node to inspect properties and relationships.
            </div>
          )}

          {/* Graph Legend */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Ontology Legend:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {Object.entries(ENTITY_CONFIG).slice(0, 6).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }} />
                  <span className="text-slate-600 truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
