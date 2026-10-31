import React from 'react';
import { Menu, Play, Bot, FileUp, Sparkles } from 'lucide-react';
import { NavTab } from './Sidebar.tsx';

interface HeaderProps {
  activeTab: NavTab;
  onOpenMobileMenu: () => void;
  onQuickAction: (action: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onQuickAction
}) => {
  const getTabLabel = (tab: NavTab): { category: string; title: string } => {
    switch (tab) {
      case 'overview':
        return { category: 'Platform', title: 'Executive Overview' };
      case 'documents':
        return { category: 'Ingestion', title: 'Document Intelligence' };
      case 'assistant':
        return { category: 'Intelligence', title: 'Policy RAG Assistant' };
      case 'graph':
        return { category: 'Ontology', title: 'Insurance Knowledge Graph' };
      case 'evaluation':
        return { category: 'Quality & Benchmarking', title: 'LLM Evaluation Lab' };
      case 'datasets':
        return { category: 'Ground Truth', title: 'Golden Datasets' };
      case 'playground':
        return { category: 'Developer', title: 'REST API Playground' };
      case 'settings':
        return { category: 'System', title: 'Platform Settings & Documentation' };
    }
  };

  const { category, title } = getTabLabel(activeTab);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Zone 1: Mobile toggle + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap overflow-hidden">
          <span className="font-semibold text-slate-700">InsureGraph</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-500">{category}</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="font-medium text-slate-900 truncate">{title}</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
        <button
          onClick={() => onQuickAction('goto_assistant')}
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          Ask Assistant
        </button>
        <button
          onClick={() => onQuickAction('goto_graph')}
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          Explore Graph
        </button>
        <button
          onClick={() => onQuickAction('goto_evaluation')}
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          Evaluation Suite
        </button>
        <button
          onClick={() => onQuickAction('goto_playground')}
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          API Explorer
        </button>
      </div>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        {activeTab === 'evaluation' ? (
          <button
            onClick={() => onQuickAction('trigger_eval')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Benchmark</span>
          </button>
        ) : activeTab === 'documents' ? (
          <button
            onClick={() => onQuickAction('upload_doc')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload Policy</span>
          </button>
        ) : (
          <button
            onClick={() => onQuickAction('goto_assistant')}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Query Assistant</span>
          </button>
        )}
      </div>
    </header>
  );
};
