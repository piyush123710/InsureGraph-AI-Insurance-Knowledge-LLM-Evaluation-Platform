import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { GoldenTestCase } from '../types/index.ts';
import { useToast } from '../components/Toast.tsx';

export const GoldenDatasetsPage: React.FC = () => {
  const [testCases, setTestCases] = useState<GoldenTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<GoldenTestCase | null>(null);

  // Form fields
  const [formData, setFormData] = useState<Partial<GoldenTestCase>>({
    question: '',
    expectedAnswer: '',
    expectedContext: '',
    relevantDocument: 'Premier Health Shield Policy 2026.pdf',
    relevantChunks: ['doc-health-2026_c1'],
    category: 'coverage',
    difficulty: 'Medium'
  });

  const { showToast } = useToast();

  const fetchDataset = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/evaluation/datasets');
      if (res.ok) {
        const data = await res.json();
        setTestCases(data.testCases || []);
      }
    } catch (err) {
      console.error('Failed to load golden test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, []);

  const handleOpenCreate = () => {
    setEditingCase(null);
    setFormData({
      question: '',
      expectedAnswer: '',
      expectedContext: '',
      relevantDocument: 'Premier Health Shield Policy 2026.pdf',
      relevantChunks: ['doc-health-2026_c1'],
      category: 'coverage',
      difficulty: 'Medium'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tc: GoldenTestCase) => {
    setEditingCase(tc);
    setFormData({ ...tc });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this golden test case?')) return;
    try {
      const res = await fetch(`/api/evaluation/datasets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Deleted Test Case', id);
        fetchDataset();
      }
    } catch (err) {
      showToast('error', 'Failed to delete test case');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question?.trim() || !formData.expectedAnswer?.trim()) {
      showToast('error', 'Validation error', 'Question and expected answer are required.');
      return;
    }

    try {
      if (editingCase) {
        const res = await fetch(`/api/evaluation/datasets/${editingCase.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast('success', 'Test Case Updated', editingCase.id);
          setIsModalOpen(false);
          fetchDataset();
        }
      } else {
        const res = await fetch('/api/evaluation/datasets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testCase: formData })
        });
        if (res.ok) {
          showToast('success', 'Test Case Created', 'Added to golden benchmark dataset.');
          setIsModalOpen(false);
          fetchDataset();
        }
      }
    } catch (err: any) {
      showToast('error', 'Save error', err.message);
    }
  };

  const exportDataset = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(testCases, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `golden_dataset_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', 'Exported JSON', `${testCases.length} test cases exported.`);
    } else {
      const headers = ['id', 'category', 'difficulty', 'relevantDocument', 'question', 'expectedAnswer', 'expectedContext'];
      const rows = testCases.map(tc => [
        `"${tc.id}"`,
        `"${tc.category}"`,
        `"${tc.difficulty}"`,
        `"${tc.relevantDocument}"`,
        `"${tc.question.replace(/"/g, '""')}"`,
        `"${tc.expectedAnswer.replace(/"/g, '""')}"`,
        `"${tc.expectedContext.replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `golden_dataset_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('success', 'Exported CSV', `${testCases.length} test cases exported.`);
    }
  };

  const filteredCases = testCases.filter(tc => {
    const matchCat = categoryFilter === 'all' || tc.category === categoryFilter;
    const matchDiff = difficultyFilter === 'all' || tc.difficulty === difficultyFilter;
    const matchQuery =
      tc.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.expectedAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.relevantDocument.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchDiff && matchQuery;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Golden Dataset Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curated ground-truth test cases across coverage, exclusions, deductibles, and adversarial bounds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDataset('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportDataset('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Test Case</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search test questions, answers, or policies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="coverage">Coverage</option>
              <option value="exclusions">Exclusions</option>
              <option value="deductibles_limits">Deductibles & Limits</option>
              <option value="claim_procedures">Claim Procedures</option>
              <option value="edge_cases_adversarial">Adversarial / Out of Scope</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Adversarial">Adversarial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Test Question</th>
                <th className="py-3 px-4">Expected Ground Truth</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No golden test cases found.
                  </td>
                </tr>
              ) : (
                filteredCases.map(tc => (
                  <tr key={tc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-[11px]">
                      {tc.id}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-slate-600 capitalize">
                        {tc.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tc.difficulty === 'Easy'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tc.difficulty === 'Medium'
                            ? 'bg-blue-50 text-blue-700'
                            : tc.difficulty === 'Hard'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {tc.difficulty}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                      <div className="line-clamp-2">{tc.question}</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
                        Target: {tc.relevantDocument}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-sm">
                      <div className="line-clamp-2 text-[11px]">{tc.expectedAnswer}</div>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(tc)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        title="Edit Case"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Case"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCase ? `Edit Test Case (${editingCase.id})` : 'Create Golden Test Case'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Question</label>
                <textarea
                  rows={2}
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is the waiting period for pre-existing diseases?"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expected Ground Truth Answer
                </label>
                <textarea
                  rows={3}
                  value={formData.expectedAnswer}
                  onChange={e => setFormData({ ...formData, expectedAnswer: e.target.value })}
                  placeholder="Exact ground truth answer based on policy clauses..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="coverage">Coverage</option>
                    <option value="exclusions">Exclusions</option>
                    <option value="deductibles_limits">Deductibles & Limits</option>
                    <option value="claim_procedures">Claim Procedures</option>
                    <option value="edge_cases_adversarial">Adversarial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Adversarial">Adversarial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Document</label>
                <input
                  type="text"
                  value={formData.relevantDocument}
                  onChange={e => setFormData({ ...formData, relevantDocument: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expected Policy Context Clause (Ground Truth Citation)
                </label>
                <textarea
                  rows={2}
                  value={formData.expectedContext}
                  onChange={e => setFormData({ ...formData, expectedContext: e.target.value })}
                  placeholder="Section 3.1: Pre-Existing Diseases..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingCase ? 'Update Test Case' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
