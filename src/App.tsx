import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { ToastProvider, useToast } from './components/Toast.tsx';
import { OverviewPage } from './pages/OverviewPage.tsx';
import { DocumentsPage } from './pages/DocumentsPage.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage.tsx';
import { EvaluationLabPage } from './pages/EvaluationLabPage.tsx';
import { GoldenDatasetsPage } from './pages/GoldenDatasetsPage.tsx';
import { ApiPlaygroundPage } from './pages/ApiPlaygroundPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'goto_assistant':
        setActiveTab('assistant');
        break;
      case 'goto_graph':
        setActiveTab('graph');
        break;
      case 'goto_evaluation':
        setActiveTab('evaluation');
        break;
      case 'goto_playground':
        setActiveTab('playground');
        break;
      case 'upload_doc':
        setActiveTab('documents');
        break;
      case 'trigger_eval':
        setActiveTab('evaluation');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onQuickAction={handleQuickAction}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && <OverviewPage onNavigate={setActiveTab} />}
          {activeTab === 'documents' && <DocumentsPage />}
          {activeTab === 'assistant' && <ChatPage />}
          {activeTab === 'graph' && <KnowledgeGraphPage />}
          {activeTab === 'evaluation' && <EvaluationLabPage />}
          {activeTab === 'datasets' && <GoldenDatasetsPage />}
          {activeTab === 'playground' && <ApiPlaygroundPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
