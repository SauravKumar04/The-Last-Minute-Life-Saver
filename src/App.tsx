import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { TerminalLogs } from './pages/TerminalLogs';
import { Settings } from './pages/Settings';
import { Shield, LayoutDashboard, Terminal, Settings as SettingsIcon, LogOut, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <aside className="w-64 bg-black border-r border-neutral-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none font-sans">
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm shrink-0">
            <div className="w-4 h-4 border-2 border-black rotate-45"></div>
          </div>
          <h1 className="text-lg font-semibold tracking-tighter uppercase text-white">Aegis</h1>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-6 space-y-6">
          {/* Overview section */}
          <div>
            <div className="px-6 text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">
              Overview
            </div>
            <button
              onClick={() => setActiveTab('landing')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium sharp-transition cursor-pointer ${
                activeTab === 'landing'
                  ? 'bg-neutral-900 text-white border-r-2 border-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-950/40'
              }`}
            >
              <div className={`w-4 h-4 border ${activeTab === 'landing' ? 'border-white opacity-60 bg-white/10' : 'border-neutral-600'}`}></div>
              System Guide
            </button>
          </div>

          {/* Management section */}
          <div>
            <div className="px-6 text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">
              Management
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium sharp-transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-neutral-900 text-white border-r-2 border-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-950/40'
              }`}
            >
              <div className={`w-4 h-4 border ${activeTab === 'dashboard' ? 'border-white opacity-60 bg-white/10' : 'border-neutral-600'}`}></div>
              Dashboard
            </button>
          </div>

          {/* System section */}
          <div>
            <div className="px-6 text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">
              System
            </div>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium sharp-transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-neutral-900 text-white border-r-2 border-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-950/40'
              }`}
            >
              <div className={`w-4 h-4 border ${activeTab === 'logs' ? 'border-white opacity-60 bg-white/10' : 'border-neutral-600'}`}></div>
              Terminal Logs
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium sharp-transition cursor-pointer mt-1 ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-white border-r-2 border-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-950/40'
              }`}
            >
              <div className={`w-4 h-4 border ${activeTab === 'settings' ? 'border-white opacity-60 bg-white/10' : 'border-neutral-600'}`}></div>
              Engine Settings
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer with Active Protocol info */}
      <div className="p-6 border-t border-neutral-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-[11px] font-mono uppercase tracking-tighter text-white">Priority Engine: Active</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-neutral-500 font-mono">v4.2.0-stable</div>
          <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-wider">saurav.kr6289</div>
        </div>
      </div>
    </aside>
  );
};

const MainViewport: React.FC = () => {
  const { activeTab } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'logs':
        return <TerminalLogs />;
      case 'settings':
        return <Settings />;
    }
  };

  return (
    <main className="flex-1 min-w-0 overflow-y-auto px-8 py-8 h-screen bg-[#000000]">
      {/* Dynamic View transition fade-in */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="max-w-7xl mx-auto h-full"
      >
        {renderContent()}
      </motion.div>
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex bg-[#000000] text-white min-h-screen">
        <Sidebar />
        <MainViewport />
      </div>
    </AppProvider>
  );
}
