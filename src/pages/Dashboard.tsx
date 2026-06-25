import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  AlertOctagon, 
  Check, 
  Trash2, 
  Activity, 
  Globe, 
  Terminal, 
  Maximize2, 
  ChevronRight, 
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Brain,
  ListTodo,
  CheckSquare,
  Square,
  Zap,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    logs, 
    stats, 
    habits,
    createTask, 
    updateTaskStatus, 
    deleteTask, 
    syncWithGoogle, 
    clearTerminalLogs,
    createHabit,
    toggleHabit,
    deleteHabit,
    syncing
  } = useApp();

  // Task inline creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected task for Rescue Modal Plan
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks tab
  const [filter, setFilter] = useState<'all' | 'pending' | 'rescued' | 'completed'>('all');

  // New Habits form state
  const [newHabitName, setNewHabitName] = useState('');
  const [showHabitForm, setShowHabitForm] = useState(false);

  // Recommendations and schedule states
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [companionTab, setCompanionTab] = useState<'terminal' | 'recommendations' | 'schedule'>('terminal');

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  
  // Speech Synthesis States
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch recommendations and schedule blocks
  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch('/api/recommendations');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule || []);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const tasksFingerprint = tasks.map(t => `${t._id}:${t.status}`).join(',');

  useEffect(() => {
    fetchRecommendations();
    fetchSchedule();
  }, [tasksFingerprint]);

  // Handle Speech recognition input
  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser environment.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      setTitle(text);
      setShowAddForm(true);
    };

    rec.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
  };

  // Speak Rescue Blueprint aloud
  const speakBlueprint = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const cleanText = text.replace(/\[.*?\]/g, '').replace(/[\#\*]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Task boundary title is required.');
      return;
    }
    if (!deadline) {
      setErrorMsg('A valid future deadline is required.');
      return;
    }

    const d = new Date(deadline);
    if (isNaN(d.getTime())) {
      setErrorMsg('Please enter a valid date and time.');
      return;
    }

    const selectedTime = d.getTime();
    if (selectedTime <= Date.now()) {
      setErrorMsg('Deadline must point to a future time boundary.');
      return;
    }

    const success = await createTask({
      title: title.trim(),
      deadline: d.toISOString(),
      originalPriority: priority,
      notes: notes.trim()
    });

    if (success) {
      setTitle('');
      setDeadline('');
      setPriority('medium');
      setNotes('');
      setShowAddForm(false);
    } else {
      setErrorMsg('Database failed to insert boundary log.');
    }
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(t => t.status === 'pending');
      case 'rescued':
        return tasks.filter(t => t.status === 'rescued');
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      default:
        return tasks;
    }
  };

  // Helper to format remaining time beautifully
  const getRemainingTimeStr = (deadlineStr: string) => {
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return 'Invalid date';
    const diffMs = d.getTime() - Date.now();
    if (diffMs <= 0) return 'Past due';
    
    const hours = Math.floor(diffMs / (1000 * 3600));
    const mins = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Upper Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Risk Card */}
        <div className="bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between h-24 sharp-transition hover:border-neutral-700">
          <span className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase font-mono">Systemic Risk Score</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold font-mono tracking-tighter text-white">{stats.averageRisk}%</span>
            <span className={`w-1.5 h-1.5 rounded-full ${stats.averageRisk > 75 ? 'bg-red-500 animate-pulse' : stats.averageRisk > 40 ? 'bg-amber-500' : 'bg-neutral-500'}`} />
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between h-24 sharp-transition hover:border-neutral-700">
          <span className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase font-mono">Active Boundaries</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold font-mono tracking-tighter text-white">{stats.pending}</span>
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Pending</span>
          </div>
        </div>

        {/* Rescued Card */}
        <div className="bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between h-24 sharp-transition hover:border-neutral-700">
          <span className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase font-mono">Mitigations Active</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold font-mono tracking-tighter text-white">{stats.rescued}</span>
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Rescued</span>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between h-24 sharp-transition hover:border-neutral-700">
          <span className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase font-mono">De-escalated Nodes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-semibold font-mono tracking-tighter text-white">{stats.completed}</span>
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Completed</span>
          </div>
        </div>
      </div>

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Tasks and Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header & Create Trigger */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tighter uppercase text-white font-mono">Tracking Ledger</h2>
              <p className="text-[11px] text-neutral-400">Monitor active risk scores and deploy AI mitigations autonomously.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceCommand}
                className={`px-3 py-1.5 border font-semibold text-[11px] uppercase tracking-wider rounded-sm sharp-transition flex items-center gap-1.5 cursor-pointer ${
                  isListening 
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
                title="Speak to Aegis: Speak your boundary name"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? 'Listening...' : 'Voice Input'}
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-white text-black font-semibold text-[11px] uppercase tracking-wider rounded-sm sharp-transition hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer"
              >
                {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {showAddForm ? 'Cancel' : 'New Boundary'}
              </button>
            </div>
          </div>

          {/* Create Task Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSubmit}
                className="bg-neutral-950 border border-neutral-800 p-5 rounded-sm space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">Task Boundary Name</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Deploy Critical API Hotfix"
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white sharp-transition"
                    />
                  </div>

                  {/* Deadline */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">Absolute Deadline Time</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white sharp-transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Severity Priority */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">Severity Metric</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-1 px-2 text-[10px] rounded border uppercase font-mono sharp-transition cursor-pointer ${
                            priority === p 
                              ? 'bg-white text-black border-white font-bold' 
                              : 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-neutral-400">Contextual Description (Optional)</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Requires authorization, logs must clear staging environment"
                      className="w-full bg-black border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white sharp-transition"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-[11px] font-mono text-red-500">{errorMsg}</p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-white text-black font-semibold text-xs rounded-sm sharp-transition hover:bg-neutral-200 cursor-pointer"
                  >
                    Register Target Boundary
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Ledger Filter Tabs */}
          <div className="flex border-b border-neutral-800 gap-4 text-[10px] font-mono uppercase tracking-wider pb-2">
            {(['all', 'pending', 'rescued', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-1 px-1 sharp-transition cursor-pointer ${
                  filter === tab 
                    ? 'text-white border-b-2 border-white font-bold' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Task Grid Table */}
          <div className="bg-[#000000] border border-neutral-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-[10px] uppercase tracking-widest text-neutral-500 font-bold font-mono">
                    <th className="py-3 px-4 font-medium">Task Node</th>
                    <th className="py-3 px-4 font-medium">Temporal Boundary</th>
                    <th className="py-3 px-4 font-medium text-center">Severity</th>
                    <th className="py-3 px-4 font-medium text-center">Dynamic Risk</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-xs font-sans">
                  {getFilteredTasks().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-neutral-500 font-mono text-[11px]">
                        No active monitoring boundary logs found.
                      </td>
                    </tr>
                  ) : (
                    getFilteredTasks().map((task) => {
                      const d = new Date(task.deadline);
                      const isOverdue = !isNaN(d.getTime()) && d.getTime() <= Date.now();
                      const isComplete = task.status === 'completed';
                      
                      return (
                        <tr 
                          key={task._id} 
                          className="hover:bg-neutral-950/60 sharp-transition group border-b border-neutral-800"
                        >
                          {/* Title & Notes */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="space-y-1">
                              <span className={`font-medium tracking-tight ${isComplete ? 'line-through text-neutral-500' : 'text-white'}`}>
                                {task.title}
                              </span>
                              {task.notes && (
                                <p className="text-[11px] text-neutral-500 leading-normal">{task.notes}</p>
                              )}
                              {task.status === 'rescued' && task.rescueAction && (
                                <div className="pt-1.5">
                                  <button
                                    onClick={() => setSelectedTask(task)}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-white text-white text-[9px] uppercase font-mono tracking-wider sharp-transition hover:bg-white hover:text-black cursor-pointer rounded-sm"
                                  >
                                    <Activity className="w-2.5 h-2.5" />
                                    Rescue Blueprint Ready
                                  </button>
                                </div>
                              )}
                              {!isComplete && (
                                <div className="text-[10px] font-mono flex items-center gap-1.5 pt-1.5 text-neutral-400">
                                  <span className="w-1 h-1 bg-white rounded-full"></span>
                                  <span>
                                    {task.dynamicScore > 75 
                                      ? "Critical risk. Deploy autonomous delegation plan immediately."
                                      : task.dynamicScore > 40
                                      ? "Buffer reduction detected. Recommended focus window: 14:00 - 15:30 today."
                                      : "Temporal margin safe. Standard execution sequence active."}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Deadline & Remaining Time */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {isComplete ? (
                              <span className="text-neutral-500 uppercase tracking-wider text-[10px]">De-escalated</span>
                            ) : (
                              <div className="space-y-0.5">
                                <div className={`flex items-center gap-1 ${isOverdue ? 'text-white font-bold' : 'text-neutral-300'}`}>
                                  <Clock className="w-3 h-3 text-neutral-500" />
                                  <span>{getRemainingTimeStr(task.deadline)}</span>
                                </div>
                                <span className="text-[9px] text-neutral-500 block">
                                  {(() => {
                                    const d = new Date(task.deadline);
                                    if (isNaN(d.getTime())) return 'Invalid Date';
                                    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                  })()}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Original Severity Pill */}
                          <td className="py-3.5 px-4 text-center font-mono text-[10px]">
                            <span className={`px-2 py-0.5 border text-[10px] uppercase font-mono rounded-sm tracking-wider ${
                              task.originalPriority === 'high' 
                                ? 'border-neutral-700 bg-white text-black font-bold' 
                                : task.originalPriority === 'medium'
                                ? 'border-neutral-700 text-white bg-neutral-900'
                                : 'border-neutral-800 text-neutral-500'
                            }`}>
                              {task.originalPriority}
                            </span>
                          </td>

                          {/* Dynamic Risk Score */}
                          <td className="py-3.5 px-4 font-mono text-center text-[11px] min-w-[90px]">
                            {isComplete ? (
                              <span className="text-neutral-500 font-medium">0%</span>
                            ) : (
                              <span className={`font-mono text-sm font-semibold tracking-tighter ${
                                task.dynamicScore > 80 
                                  ? 'text-white underline decoration-red-500 decoration-2 underline-offset-4' 
                                  : task.dynamicScore > 40 
                                  ? 'text-white underline decoration-amber-500 decoration-2 underline-offset-4' 
                                  : 'text-neutral-400'
                              }`}>
                                {task.dynamicScore}
                              </span>
                            )}
                          </td>

                          {/* Action Controls */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {!isComplete && (
                                <button
                                  onClick={() => updateTaskStatus(task._id, 'completed')}
                                  title="Mark as Completed"
                                  className="p-1.5 bg-neutral-900 border border-neutral-800 rounded hover:bg-white hover:text-black hover:border-white text-neutral-400 sharp-transition cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteTask(task._id)}
                                title="Deregister Boundary"
                                className="p-1.5 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 text-neutral-500 hover:text-red-500 sharp-transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Companion Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Header with Workspace Tabs */}
          <div className="bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm space-y-4">
            <div className="flex border-b border-neutral-800 text-[10px] font-mono uppercase tracking-wider pb-2 justify-between items-center">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-white" />
                Aegis Companion
              </span>
              <div className="flex gap-2">
                {(['terminal', 'recommendations', 'schedule'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setCompanionTab(tab);
                      if (tab === 'recommendations') fetchRecommendations();
                      if (tab === 'schedule') fetchSchedule();
                    }}
                    className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-wider sharp-transition cursor-pointer ${
                      companionTab === tab 
                        ? 'bg-white text-black font-bold' 
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content 1: Terminal */}
            {companionTab === 'terminal' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">kernel_telemetry_stream</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={clearTerminalLogs}
                      className="px-1.5 py-0.5 border border-neutral-800 rounded-sm hover:border-neutral-700 text-[9px] font-mono text-neutral-400 sharp-transition cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={syncWithGoogle}
                      disabled={syncing}
                      className="px-1.5 py-0.5 bg-white text-black rounded-sm hover:bg-neutral-200 text-[9px] font-mono font-bold uppercase tracking-wider sharp-transition disabled:opacity-50 cursor-pointer"
                    >
                      {syncing ? 'Syncing...' : 'Google Sync'}
                    </button>
                  </div>
                </div>

                <div className="bg-black/40 border border-neutral-900 rounded p-3 h-[240px] overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5">
                  {logs.length === 0 ? (
                    <p className="text-neutral-600 italic">[SYSTEM] No activity registered. Listening for events...</p>
                  ) : (
                    logs.slice(0, 30).map((log) => {
                      let tagColor = 'text-white';
                      let tagText = '[SYS]';
                      let messageColor = 'text-neutral-400';
                      
                      if (log.type === 'warning') {
                        tagColor = 'text-amber-500 font-bold';
                        tagText = '[WARN]';
                        messageColor = 'text-neutral-300';
                      } else if (log.type === 'success') {
                        tagColor = 'text-white font-bold';
                        tagText = '[OK]';
                        messageColor = 'text-neutral-400';
                      } else if (log.type === 'action') {
                        tagColor = 'text-red-500 font-bold';
                        tagText = '[MIT]';
                        messageColor = 'text-white';
                      }

                      return (
                        <div key={log._id} className="text-[10px]">
                          <span className="text-neutral-600 mr-1.5">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className={`${tagColor} mr-1.5`}>{tagText}</span>
                          <span className={messageColor}>{log.message}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Tab content 2: AI Recommendations */}
            {companionTab === 'recommendations' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">proactive_focus_audits</span>
                  <button
                    type="button"
                    onClick={fetchRecommendations}
                    disabled={loadingRecs}
                    className="px-1.5 py-0.5 border border-neutral-800 rounded-sm hover:border-neutral-700 text-[9px] font-mono text-neutral-400 sharp-transition cursor-pointer disabled:opacity-50"
                  >
                    {loadingRecs ? 'Analyzing...' : 'Refresh Audit'}
                  </button>
                </div>

                <div className="bg-black/40 border border-neutral-900 rounded p-4 h-[240px] overflow-y-auto space-y-3">
                  {loadingRecs ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <div className="w-4 h-4 border-t border-white rounded-full animate-spin"></div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Compiling AI Focus Audit...</span>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <p className="text-neutral-600 font-mono text-[10px] italic">No active priority recommendations generated. Click refresh.</p>
                  ) : (
                    <div className="space-y-3 font-mono text-[11px] text-neutral-300">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <span className="text-neutral-500 font-bold text-[10px] pt-0.5">0{idx + 1}</span>
                          <p className="leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab content 3: AI Schedule Plan */}
            {companionTab === 'schedule' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">optimal_execution_blocks</span>
                  <button
                    type="button"
                    onClick={fetchSchedule}
                    disabled={loadingSchedule}
                    className="px-1.5 py-0.5 border border-neutral-800 rounded-sm hover:border-neutral-700 text-[9px] font-mono text-neutral-400 sharp-transition cursor-pointer disabled:opacity-50"
                  >
                    {loadingSchedule ? 'Scheduling...' : 'Recalculate'}
                  </button>
                </div>

                <div className="bg-black/40 border border-neutral-900 rounded p-3 h-[240px] overflow-y-auto space-y-2.5">
                  {loadingSchedule ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <div className="w-4 h-4 border-t border-white rounded-full animate-spin"></div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Assembling calendar slots...</span>
                    </div>
                  ) : schedule.length === 0 ? (
                    <p className="text-neutral-600 font-mono text-[10px] italic">No dynamic calendar blocks built yet.</p>
                  ) : (
                    <div className="space-y-2 font-mono">
                      {schedule.map((block, idx) => (
                        <div key={idx} className="border border-neutral-900 bg-neutral-950/40 p-2 rounded-sm space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[9px] text-neutral-500 font-bold">{block.time}</span>
                            <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full"></span>
                          </div>
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-tight">{block.activity}</h4>
                          <p className="text-[9px] text-neutral-400 leading-normal">{block.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Daily Focus Goals & Habits Tracker Card */}
          <div className="bg-neutral-950/20 border border-neutral-800 p-4 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-white" />
                Cognitive Habits & Goals
              </span>
              <button
                type="button"
                onClick={() => setShowHabitForm(!showHabitForm)}
                className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 hover:text-white sharp-transition cursor-pointer"
              >
                {showHabitForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {/* Add Habit inline Form */}
            <AnimatePresence>
              {showHabitForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newHabitName.trim()) return;
                    const ok = await createHabit(newHabitName);
                    if (ok) {
                      setNewHabitName('');
                      setShowHabitForm(false);
                    }
                  }}
                  className="space-y-2 overflow-hidden pb-1"
                >
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Inbox Zero Clear"
                    className="w-full bg-black border border-neutral-800 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-white font-mono sharp-transition"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-2 py-0.5 bg-white text-black text-[9px] font-mono font-bold uppercase rounded-sm hover:bg-neutral-200 cursor-pointer"
                    >
                      Commit Goal
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Habits list */}
            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-neutral-600 font-mono text-[10px] italic">No persistent focus goals active.</p>
              ) : (
                habits.map((habit) => (
                  <div 
                    key={habit._id} 
                    className="flex items-center justify-between p-2 border border-neutral-900 bg-black/25 rounded-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleHabit(habit._id)}
                        className="text-neutral-400 hover:text-white sharp-transition cursor-pointer"
                      >
                        {habit.completedToday ? (
                          <CheckSquare className="w-4 h-4 text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-700" />
                        )}
                      </button>
                      <span className={`text-[11px] font-sans tracking-tight leading-none ${habit.completedToday ? 'line-through text-neutral-500' : 'text-neutral-300'}`}>
                        {habit.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[10px]">
                      {habit.streak > 0 && (
                        <span className="text-white font-bold bg-neutral-900 px-1.5 py-0.5 rounded-sm border border-neutral-800 text-[8px] tracking-widest uppercase">
                          🔥 {habit.streak}d streak
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteHabit(habit._id)}
                        className="text-neutral-600 hover:text-red-500 sharp-transition cursor-pointer"
                        title="Remove Habit"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* High-Fidelity Rescue Plan Modal Drawer */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-black border border-neutral-800 max-w-xl w-full rounded-sm overflow-hidden shadow-2xl"
            >
              <div className="bg-neutral-950 px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold tracking-widest uppercase font-mono text-white">Autonomous Rescue Strategy</span>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900 sharp-transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">Task Node Scope</div>
                  <h3 className="text-base font-bold text-white tracking-tight uppercase font-mono">{selectedTask.title}</h3>
                  {selectedTask.notes && (
                    <p className="text-xs text-neutral-400 font-sans italic">Context: "{selectedTask.notes}"</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 border-y border-neutral-900 font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest font-bold">Temporal Risk</span>
                    <span className="text-white font-bold">{selectedTask.dynamicScore}% Index</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest font-bold">Critical Threshold Status</span>
                    <span className="text-white font-bold uppercase">12h Threshold Breached</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">Calculated Rescue Blueprint</div>
                  <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-sm text-xs leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto text-neutral-300">
                    {selectedTask.rescueAction}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950 px-6 py-4 border-t border-neutral-800 flex justify-between items-center text-xs">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Blueprint delivered. Autonomous status applied.</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => speakBlueprint(selectedTask.rescueAction || '')}
                    className={`px-3 py-1.5 border font-bold uppercase text-[10px] tracking-widest rounded-sm sharp-transition flex items-center gap-1.5 cursor-pointer ${
                      isSpeaking 
                        ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isSpeaking ? 'Mute AI' : 'Speak Plan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTask.rescueAction || '');
                      alert('Rescue plan copied to clipboard.');
                    }}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-sm sharp-transition hover:bg-neutral-200 cursor-pointer"
                  >
                    Copy Blueprint Text
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
