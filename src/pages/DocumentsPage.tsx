import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  Layers,
  RefreshCw,
  Search,
  CheckCircle2,
  Plus,
  X,
  FileCode,
  Tag
} from 'lucide-react';
import { InsuranceDocument, DocumentChunk } from '../types/index.ts';
import { useToast } from '../components/Toast.tsx';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<InsuranceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<{ doc: InsuranceDocument; chunks: DocumentChunk[] } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'health' | 'motor' | 'life' | 'property' | 'travel'>('health');
  const [uploadPolicyType, setUploadPolicyType] = useState('Standard Health Policy Schedule');
  const [uploadContent, setUploadContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      showToast('error', 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleInspectChunks = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewDoc({ doc: data.document, chunks: data.chunks });
      }
    } catch (err) {
      showToast('error', 'Failed to load document chunks');
    }
  };

  const handleDelete = async (docId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all associated vectors?`)) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Document deleted', `Removed ${name} and associated vector embeddings.`);
        fetchDocuments();
        if (previewDoc?.doc.id === docId) setPreviewDoc(null);
      }
    } catch (err) {
      showToast('error', 'Failed to delete document');
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/process`, { method: 'POST' });
      if (res.ok) {
        showToast('success', 'Vector Store Re-indexed', 'Re-chunked and extracted knowledge graph entities.');
        fetchDocuments();
      }
    } catch (err) {
      showToast('error', 'Failed to reprocess document');
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim() || !uploadContent.trim()) {
      showToast('error', 'Validation Error', 'Document title and text content are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName,
          category: uploadCategory,
          policyType: uploadPolicyType,
          content: uploadContent
        })
      });

      if (res.ok) {
        showToast('success', 'Document Ingested', `Created ${uploadName} with vector embeddings and graph entities.`);
        setIsUploadOpen(false);
        setUploadName('');
        setUploadContent('');
        fetchDocuments();
      } else {
        const errData = await res.json();
        showToast('error', 'Upload failed', errData.error || 'Server error');
      }
    } catch (err: any) {
      showToast('error', 'Upload Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPresetPolicy = (type: 'cyber' | 'marine' | 'directors') => {
    if (type === 'cyber') {
      setUploadName('Enterprise Cyber Shield Policy 2026.pdf');
      setUploadCategory('property');
      setUploadPolicyType('Cyber Risk & Extortion Coverage');
      setUploadContent(`
SECTION 1: CYBER INSURING AGREEMENT
1.1 Ransomware & Extortion Reimbursement: Covers certified cyber extortion costs, negotiation consultant fees, and paid extortion demands approved by the Insurer up to $2,000,000 aggregate.
1.2 Incident Response & Forensics: Reimburses IT digital forensic investigators, legal crisis counsel, and data restoration specialists up to $500,000.
1.3 Regulatory Fines & GDPR Penalties: Indemnifies privacy breach regulatory penalties levied under GDPR or CCPA up to $1,000,000 where legally insurable.

SECTION 2: DEDUCTIBLES & CONDITIONS
2.1 Waiting Period: A 12-hour business interruption waiting period applies before network outage indemnity becomes payable.
2.2 Mandatory Multi-Factor Authentication (MFA): All remote corporate access and privileged root accounts must enforce MFA; failure to enforce MFA voids claims arising from credential compromise.
      `.trim());
    } else if (type === 'marine') {
      setUploadName('Marine Ocean Cargo Transit Policy 2026.pdf');
      setUploadCategory('motor');
      setUploadPolicyType('Commercial Cargo Marine Transit');
      setUploadContent(`
SECTION 1: VOYAGE CARGO INDEMNITY
1.1 Institute Cargo Clauses (A) All-Risks: Covers physical loss or damage to scheduled container cargo during ocean and intermodal transit caused by stranding, sinking, burning, collision, or jettison.
1.2 General Average Contribution: Reimburses General Average and salvage charges declared under York-Antwerp Rules.

SECTION 2: EXCLUSIONS
2.1 Inherent Vice: Loss arising from inherent vice, mold, shrinkage, or spontaneous fermentation is excluded.
2.2 Insufficiency of Packing: Loss caused by inadequate export packing or improper container stowage conducted by the shipper is excluded.
      `.trim());
    } else {
      setUploadName('Directors & Officers Liability Policy 2026.pdf');
      setUploadCategory('life');
      setUploadPolicyType('D&O Corporate Governance');
      setUploadContent(`
SECTION 1: EXECUTIVE PROTECTION (SIDE A)
1.1 Non-Indemnified Loss: Pays defense costs and settlement liabilities of insured directors and corporate officers where the corporate entity is unable or legally barred from indemnifying them, up to $5,000,000.
1.2 Shareholder Derivative Actions: Covers legal defense expenditures incurred in defending shareholder derivative litigation alleging breach of fiduciary duty.

SECTION 2: EXCLUSIONS
2.1 Deliberate Fraud & Dishonesty: Excludes claims established by final non-appealable adjudication to have arisen from willful intentional fraud or illegal personal profit.
      `.trim());
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.policyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Document Intelligence Module
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingest, extract, clean, chunk, and embed insurance policy documentation for semantic retrieval.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload & Ingest Policy</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search policy name, terms, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg">
          {['all', 'health', 'motor', 'life', 'property', 'travel'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Policy Class</th>
                <th className="py-3 px-4">Size & Chunks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Indexed On</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No documents matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold">{doc.name}</span>
                          <span className="block text-[11px] text-slate-400 font-mono mt-0.5">{doc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-medium">{doc.policyType}</span>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider">{doc.category}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      <div>{(doc.size / 1024).toFixed(1)} KB</div>
                      <div className="text-[10px] text-slate-400">{doc.chunkCount} chunks · ~{doc.tokenCount} tokens</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Indexed (Vector DB)</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(doc.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleInspectChunks(doc.id)}
                        className="px-2.5 py-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors inline-flex items-center gap-1 font-medium"
                        title="Inspect Chunks"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Chunks ({doc.chunkCount})</span>
                      </button>

                      <button
                        onClick={() => handleReprocess(doc.id)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        title="Re-process vectors and entities"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chunk Inspector Drawer / Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Semantic Chunks Inspector: {previewDoc.doc.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {previewDoc.chunks.length} extracted chunks indexed into vector storage
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {previewDoc.chunks.map(chunk => (
                <div key={chunk.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{chunk.section}</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      Page {chunk.pageNumber} · {chunk.tokenCount} tokens · {chunk.clauseId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-white p-2.5 rounded border border-slate-200">
                    {chunk.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Ingestion Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Upload & Ingest Policy Document</h3>
                <p className="text-xs text-slate-500">
                  Text cleaning, clause splitting, vector embeddings, and knowledge graph mapping
                </p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Presets quick load */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Load Synthetic Policy Preset:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadPresetPolicy('cyber')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                  >
                    Cyber Risk Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetPolicy('marine')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                  >
                    Marine Cargo Transit
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPresetPolicy('directors')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
                  >
                    D&O Corporate Policy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Name (.pdf / .txt)</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                    placeholder="e.g. Commercial Fleet Policy 2026.pdf"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs capitalize bg-white"
                  >
                    <option value="health">Health Insurance</option>
                    <option value="motor">Commercial Motor</option>
                    <option value="life">Term Life / Disability</option>
                    <option value="property">Property & BI</option>
                    <option value="travel">Travel Medical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Policy Type / Plan Class</label>
                <input
                  type="text"
                  value={uploadPolicyType}
                  onChange={e => setUploadPolicyType(e.target.value)}
                  placeholder="e.g. All-Risk Comprehensive Schedule"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Policy Text Content (Sections, Clauses & Exclusions)
                </label>
                <textarea
                  rows={8}
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="SECTION 1: COVERAGE SCOPE...&#10;SECTION 2: DEDUCTIBLES & CONDITIONS..."
                  className="w-full p-3 font-mono border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Processing Vectors...' : 'Ingest & Index'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
