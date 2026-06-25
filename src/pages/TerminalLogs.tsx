import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Terminal, Trash2, Calendar, ShieldCheck, Cpu } from 'lucide-react';

export const TerminalLogs: React.FC = () => {
  const { logs, clearTerminalLogs } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'info' | 'warning' | 'success' | 'action'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          (log.taskTitle && log.taskTitle.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate statistics from current logs list
  const totalCount = logs.length;
  const criticalCount = logs.filter(l => l.type === 'warning').length;
  const mitCount = logs.filter(l => l.type === 'action').length;
  const successCount = logs.filter(l => l.type === 'success').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tighter uppercase font-mono flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-white" />
            Core Audit & Diagnostics
          </h2>
          <p className="text-[11px] text-neutral-400">Complete, raw log telemetry streams of systemic evaluations, interventions, and thread syncs.</p>
        </div>

        <button
          onClick={clearTerminalLogs}
          className="self-start md:self-auto px-3 py-1.5 border border-neutral-800 rounded-sm hover:border-white text-neutral-400 hover:text-white text-xs font-mono sharp-transition cursor-pointer"
        >
          Clear Console Records
        </button>
      </div>

      {/* Audit Stats Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm font-mono text-xs">
        <div className="space-y-1 p-2">
          <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Telemetry Frames</span>
          <p className="text-lg font-bold text-white">{totalCount} logs</p>
        </div>
        <div className="space-y-1 p-2 border-l border-neutral-800">
          <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Urgent Alerts Raised</span>
          <p className="text-lg font-bold text-white underline decoration-amber-500 decoration-2 underline-offset-4">{criticalCount} incidents</p>
        </div>
        <div className="space-y-1 p-2 border-l border-neutral-800">
          <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Mitigation Blueprints</span>
          <p className="text-lg font-bold text-white underline decoration-neutral-500 decoration-2 underline-offset-4">{mitCount} drafts</p>
        </div>
        <div className="space-y-1 p-2 border-l border-neutral-800">
          <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold">Successful Syncs</span>
          <p className="text-lg font-bold text-white underline decoration-neutral-300 decoration-2 underline-offset-4">{successCount} nodes</p>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-neutral-800 pb-4">
        {/* Type Buttons */}
        <div className="flex gap-2 text-[10px] font-mono w-full md:w-auto uppercase tracking-wider">
          {(['all', 'info', 'warning', 'success', 'action'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 border rounded-sm capitalize sharp-transition cursor-pointer ${
                filterType === type 
                  ? 'bg-white text-black border-white font-bold' 
                  : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {type === 'action' ? 'Mitigations' : type}
            </button>
          ))}
        </div>

        {/* Text Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diagnostic traces..."
            className="w-full bg-black border border-neutral-800 rounded-sm px-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white sharp-transition font-mono"
          />
        </div>
      </div>

      {/* Core Terminal Trace Area */}
      <div className="bg-black border border-neutral-800 rounded-sm overflow-hidden font-mono text-xs">
        <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex justify-between items-center text-neutral-500 text-[10px] uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-neutral-500" />
            aegis_kernel_audit_report
          </span>
          <span>Buffer: {filteredLogs.length} items matched</span>
        </div>

        <div className="p-5 space-y-3 bg-black max-h-[600px] overflow-y-auto leading-relaxed select-text font-mono">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">
              No matching diagnostic trace lines found inside scope.
            </div>
          ) : (
            filteredLogs.map((log) => {
              let tagStyle = 'border-neutral-800 text-neutral-500';
              let lineStyle = 'text-neutral-400';
              let tagText = 'SYSTEM';
              
              if (log.type === 'warning') {
                tagStyle = 'border-neutral-700 bg-white text-black font-bold';
                lineStyle = 'text-white';
                tagText = 'AGENT';
              } else if (log.type === 'success') {
                tagStyle = 'border-neutral-800 text-neutral-300';
                lineStyle = 'text-neutral-400';
                tagText = 'SYSTEM';
              } else if (log.type === 'action') {
                tagStyle = 'border-neutral-700 bg-neutral-900 text-white font-bold';
                lineStyle = 'text-white';
                tagText = 'RESCUE';
              }

              return (
                <div key={log._id} className="flex flex-col md:flex-row md:items-start gap-3 border-b border-neutral-950 pb-3">
                  {/* Timestamp */}
                  <div className="text-neutral-600 font-mono text-[10px] shrink-0 pt-0.5 select-none md:w-36">
                    {(() => {
                      const d = new Date(log.timestamp);
                      return isNaN(d.getTime()) ? 'Invalid Time' : d.toISOString();
                    })()}
                  </div>

                  {/* Level Tag */}
                  <div className="shrink-0 select-none">
                    <span className={`px-2 py-0.5 border text-[9px] font-mono uppercase tracking-wider rounded-sm ${tagStyle}`}>
                      {tagText}
                    </span>
                  </div>

                  {/* Message & Trace link */}
                  <div className="space-y-1 flex-1">
                    <p className={`font-mono text-[11px] ${lineStyle}`}>{log.message}</p>
                    {log.taskTitle && (
                      <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] select-none uppercase tracking-wider font-bold">
                        <Calendar className="w-3 h-3 text-neutral-600" />
                        <span>Bound Node Link: "{log.taskTitle}"</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
