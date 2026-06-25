import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Key, Cpu, Database, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { tasks, fetchTasks, fetchLogs } = useApp();
  const [dbType, setDbType] = useState<'json-file' | 'mongodb'>('json-file');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll system health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setDbType(data.db === 'mongodb' ? 'mongodb' : 'json-file');
        }
      } catch (err) {
        console.error('Failed to poll health checks:', err);
      }
    };
    checkHealth();
  }, []);

  // Simple seed function to quickly add demo datasets
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const mockData = [
        {
          title: '[CRITICAL] Fix API Authentication Memory Leak',
          deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours left - triggers immediate rescue!
          originalPriority: 'high',
          notes: 'Session caches are crashing the production load balancer pools under peak loads.'
        },
        {
          title: '[URGENT] Final Review: Pitch Deck for Board Meeting',
          deadline: new Date(Date.now() + 11 * 3600 * 1000).toISOString(), // 11 hours left - triggers immediate rescue!
          originalPriority: 'high',
          notes: 'Make sure all financials align with the revised Q2 balance sheets.'
        },
        {
          title: 'Review Peer Pull Requests for Frontend Redesign',
          deadline: new Date(Date.now() + 28 * 3600 * 1000).toISOString(), // 28 hours left
          originalPriority: 'medium',
          notes: 'Ensure tailwind typography configs match the design spec guidelines.'
        },
        {
          title: 'Weekly Standup Summary Write-up',
          deadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(), // 3 days left
          originalPriority: 'low',
          notes: 'Consolidate progress notes from Slack channel updates.'
        }
      ];

      for (const item of mockData) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }

      await fetchTasks();
      await fetchLogs();
      alert('High-priority demo task bounds successfully seeded to Ledger and Engine.');
    } catch (err) {
      console.error('Error seeding demo bounds:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleManualSweep = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        await fetchTasks();
        await fetchLogs();
      }
    } catch (err) {
      console.error('Manual priority sweep failed:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tighter uppercase font-mono flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-white" />
          Aegis System Settings
        </h2>
        <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider">Kernel settings, database storage protocols, and surveillance calibrations.</p>
      </div>

      {/* Grid Status Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core System Status Diagnostics */}
        <div className="bg-black border border-neutral-800 rounded-sm p-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono border-b border-neutral-800 pb-3 text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-neutral-400" />
            Hardware & Database Diagnostic
          </h3>

          <div className="space-y-4 text-xs font-mono">
            {/* Database */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-neutral-300 block font-bold uppercase tracking-wider text-[11px]">Active Database Client</span>
                <span className="text-neutral-500 text-[10px] uppercase">Mongoose Mappings & Schemas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-neutral-500" />
                <span className={`px-2 py-0.5 border rounded-sm text-[10px] uppercase font-bold tracking-wider ${
                  dbType === 'mongodb' 
                    ? 'border-neutral-700 text-white bg-neutral-900' 
                    : 'border-neutral-800 text-neutral-500'
                }`}>
                  {dbType === 'mongodb' ? 'MongoDB Server' : 'Local JSON Persist'}
                </span>
              </div>
            </div>

            {/* AI Engine */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-neutral-300 block font-bold uppercase tracking-wider text-[11px]">Mitigation Generation Engine</span>
                <span className="text-neutral-500 text-[10px] uppercase">@google/genai (gemini-3.5-flash)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neutral-500" />
                <span className="px-2 py-0.5 border border-neutral-700 text-white bg-neutral-900 rounded-sm text-[10px] uppercase font-bold tracking-wider">
                  Surveillance Active
                </span>
              </div>
            </div>

            {/* Priority Engine Interval */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-neutral-300 block font-bold uppercase tracking-wider text-[11px]">Priority Sweep Calibrations</span>
                <span className="text-neutral-500 text-[10px] uppercase">Auto-interval analysis frequency</span>
              </div>
              <span className="text-neutral-300 font-bold uppercase">Every 15 Seconds</span>
            </div>

            {/* Active Nodes */}
            <div className="flex items-center justify-between pb-1">
              <div className="space-y-0.5">
                <span className="text-neutral-300 block font-bold uppercase tracking-wider text-[11px]">Active Telemetry Nodes</span>
                <span className="text-neutral-500 text-[10px] uppercase">Current database boundary counts</span>
              </div>
              <span className="text-neutral-300 font-bold uppercase">{tasks.length} boundaries</span>
            </div>
          </div>
        </div>

        {/* Tactical Actions Panel */}
        <div className="bg-black border border-neutral-800 rounded-sm p-6 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest font-mono border-b border-neutral-800 pb-3 text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-400" />
            Control Commands & Diagnostics
          </h3>

          <div className="space-y-5 font-sans">
            {/* Seed Demo Task Data */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">T-Minus 12h Simulation Sandbox</h4>
              <p className="text-xs text-neutral-400 leading-relaxed text-[11px]">
                Need to quickly evaluate how the PriorityEngine and Gemini calculate rescue blueprints? Use this tool to inject 4 realistic tasks immediately, including 2 critical tasks that sit below the 12-hour safety threshold.
              </p>
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="w-full py-2 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-sm sharp-transition hover:bg-neutral-200 cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? 'Injecting Mock Bounds...' : 'Inject Mitigation Sandbox Dataset'}
              </button>
            </div>

            {/* Manual Sweep */}
            <div className="space-y-2 pt-2 border-t border-neutral-900">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Manual Priority Recalculation</h4>
              <p className="text-xs text-neutral-400 leading-relaxed text-[11px]">
                Force the system to perform a diagnostic sweep across all task boundaries to compute active temporal risk scales immediately.
              </p>
              <button
                onClick={handleManualSweep}
                disabled={isRefreshing}
                className="w-full py-2 border border-neutral-800 hover:border-white text-white font-bold uppercase tracking-widest text-[10px] rounded-sm sharp-transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Recomputing Risks...' : 'Run Manual Risk Calibration Sweep'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Corporate Architecture Disclaimer */}
      <div className="bg-black border border-neutral-800 rounded-sm p-5 flex items-start gap-4">
        <CheckCircle2 className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs">
          <span className="font-bold text-white uppercase tracking-wider font-mono block">Compliance & Enterprise Staging</span>
          <p className="text-neutral-400 leading-relaxed font-sans text-[11px]">
            Aegis utilizes a production-grade dual database strategy mapping custom Mongoose schemas to MongoDB instances natively. For offline sandbox operations in local staging contexts, data is routed gracefully via a transparent fallback service to the system local filesystem database. This ensures complete reliability and speed with 100% of the data persisted.
          </p>
        </div>
      </div>
    </div>
  );
};
