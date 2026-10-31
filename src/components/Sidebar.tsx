import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Bot,
  Network,
  FlaskConical,
  Database,
  Terminal,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'documents'
  | 'assistant'
  | 'graph'
  | 'evaluation'
  | 'datasets'
  | 'playground'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  documentCount?: number;
  testCaseCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  documentCount = 5,
  testCaseCount = 52,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeDesc?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Document Intelligence', icon: FileText, badge: documentCount },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'evaluation', label: 'Evaluation Lab', icon: FlaskConical },
    { id: 'datasets', label: 'Golden Datasets', icon: Database, badge: testCaseCount },
    { id: 'playground', label: 'API Playground', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white leading-tight">
              InsureGraph AI
            </span>
            <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Knowledge & Evaluation Lab
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-blue-500/50 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Footnote */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">RAG Engine:</span>
            <span className="text-slate-300 font-mono text-[11px]">Gemini 3.8 Flash</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
            <span className="font-medium">Graph Engine:</span>
            <span className="text-slate-300 font-mono text-[11px]">NetworkX / BFS</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
            <span className="font-medium">Vector Store:</span>
            <span className="text-emerald-400 font-medium text-[11px]">Synchronized</span>
          </div>
        </div>
      </aside>
    </>
  );
};
