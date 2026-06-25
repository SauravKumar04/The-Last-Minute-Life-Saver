import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  ArrowRight, 
  Cpu, 
  Sparkles, 
  Mic, 
  CheckCircle, 
  Terminal, 
  Flame, 
  Zap, 
  BookOpen, 
  HelpCircle,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, createTask, clearTerminalLogs, createHabit, tasks } = useApp();
  const [deploying, setDeploying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleDeployDemo = async () => {
    setDeploying(true);
    setSuccessMsg('');
    try {
      // Clear logs first to start clean
      await clearTerminalLogs();

      // Create a critical task due in 2 hours (this automatically breaches the 12-hour safe limit!)
      await createTask({
        title: 'Emergency Server Firewall Upgrade',
        deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        originalPriority: 'high',
        notes: 'Apply immediate emergency patch to prevent active port-scan breach. Database credentials exposed in temporary staging directory.'
      });

      // Create a medium risk task due in 14 hours
      await createTask({
        title: 'Submit Q2 Engineering Metrics & Audits',
        deadline: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
        originalPriority: 'medium',
        notes: 'Aggregate test coverage indexes, build pipelines, and compliance checklist for internal director audit.'
      });

      // Create a low risk task due in 40 hours
      await createTask({
        title: 'Review Staging Pipeline Configuration',
        deadline: new Date(Date.now() + 40 * 3600 * 1000).toISOString(),
        originalPriority: 'low',
        notes: 'Optimize asset bundling rules and inspect server-side cache headers for production release.'
      });

      // Add a helpful habit
      await createHabit('Perform Daily Staging Triage Sweep');
      await createHabit('Inbox Cleanse & Delegation Audit');

      setSuccessMsg('Live demo scenarios deployed! System telemetry active.');
      
      // Auto redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to seed demo scenario:', err);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-12 select-none font-sans pb-16">
      
      {/* 1. Header Hero section */}
      <div className="relative border border-neutral-800 bg-neutral-950/20 rounded-sm p-8 md:p-12 overflow-hidden">
        {/* Subtle grid backdrop decoration */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-neutral-300">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Aegis Operating Kernel
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-white leading-none">
            PRIORITIZE SECONDS.<br />
            <span className="text-neutral-500 font-light">AUTONOMOUSLY MITIGATE RISK.</span>
          </h1>
          
          <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-xl">
            Aegis is an elite priority-defense agent. It automatically tracks temporal deadlines, evaluates dynamic risk indicators, and generates real-time mitigation playbooks via Gemini.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-sm sharp-transition hover:bg-neutral-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Initialize Control Panel
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={handleDeployDemo}
              disabled={deploying}
              className="px-6 py-3 bg-neutral-950 border border-neutral-800 text-neutral-300 font-semibold text-xs uppercase tracking-widest rounded-sm sharp-transition hover:border-neutral-600 hover:text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {deploying ? (
                <>
                  <div className="w-3.5 h-3.5 border-t border-white rounded-full animate-spin"></div>
                  Deploying Scenario...
                </>
              ) : successMsg ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  Deployed Successfully
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-neutral-400" />
                  Inject Live Demo Scenario
                </>
              )}
            </button>
          </div>
          
          {successMsg && (
            <p className="text-[11px] font-mono text-green-400 animate-pulse">{successMsg}</p>
          )}
        </div>
      </div>

      {/* 2. Core Operational Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-neutral-800 bg-neutral-950/10 p-6 rounded-sm space-y-4">
          <div className="w-8 h-8 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold tracking-widest uppercase font-mono text-white">Dynamic Scoring Engine</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Calculates an active Temporal Risk Index (0-100%) dynamically based on custom deadlines and initial weights. Live calculations run continuously in the background.
          </p>
        </div>

        <div className="border border-neutral-800 bg-neutral-950/10 p-6 rounded-sm space-y-4">
          <div className="w-8 h-8 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold tracking-widest uppercase font-mono text-white">Autonomous AI Rescue</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            When any deadline breaches the 12-hour temporal safe zone, Aegis triggers Gemini to craft complete action blueprints, extension notices, and delegation plans automatically.
          </p>
        </div>

        <div className="border border-neutral-800 bg-neutral-950/10 p-6 rounded-sm space-y-4">
          <div className="w-8 h-8 rounded-sm bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold tracking-widest uppercase font-mono text-white">Vocal Co-Pilot</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Command your operating environment hands-free. State task titles using voice input and listen to synthesized verbal audio readbacks of critical rescue blueprints.
          </p>
        </div>
      </div>

      {/* 3. Detailed "How It Works" Stepper */}
      <div className="border border-neutral-800 bg-neutral-950/5 rounded-sm p-6 md:p-8 space-y-8">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white" />
          <h2 className="text-sm font-mono font-bold tracking-widest uppercase text-white">System Guide & Walkthrough</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <div className="space-y-3 relative">
            <div className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-widest">Phase 01</div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Create Risk Boundary
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Open the task wizard and enter your project details. Select raw high, medium, or low priority parameters and specify the exact target delivery timestamp.
            </p>
          </div>

          <div className="space-y-3 relative">
            <div className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-widest">Phase 02</div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Watch Telemetry Scale
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The internal Priority Engine calculates dynamic risk percentages. As deadlines approach, the score ticks up, alerting you to decreasing temporal safety buffers.
            </p>
          </div>

          <div className="space-y-3 relative">
            <div className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-widest">Phase 03</div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Trigger AI Rescue
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When a pending item drops below 12 hours remaining, Aegis transitions its status to <strong className="text-red-400">Rescued</strong> and deploys Gemini to craft a custom emergency blueprint.
            </p>
          </div>

          <div className="space-y-3 relative">
            <div className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-widest">Phase 04</div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Perform Mitigation
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Click the task card to open the Rescue Console. Review the customized plan, command the AI to dictate the instructions verbally, or copy the template instantly.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Help / FAQ Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="border border-neutral-800 p-6 rounded-sm space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-white" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">System FAQs</h4>
          </div>
          
          <div className="space-y-4 font-mono text-[11px] leading-relaxed">
            <div className="space-y-1">
              <p className="text-white font-bold uppercase">Q: What is the dynamic priority score?</p>
              <p className="text-neutral-400">A: It is a scale of 0 to 100 calculated from remaining time and weight. Below 12 hours, a task automatically triggers the AI recovery state.</p>
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold uppercase">Q: How does Voice Input work?</p>
              <p className="text-neutral-400">A: Tap "Voice Input" in the task manager, say your boundary name, and the speech engine will automatically fill in the title field.</p>
            </div>
          </div>
        </div>

        <div className="border border-neutral-800 p-6 rounded-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-white" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Staging Operations</h4>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Because you requested a clean setup, your database currently has no active boundaries. We recommend injecting the live demo scenarion to inspect the interface with fully hydrated telemetry data.
            </p>
          </div>

          <button
            onClick={handleDeployDemo}
            disabled={deploying}
            className="w-full py-2.5 mt-4 border border-neutral-800 hover:border-neutral-500 rounded-sm font-mono text-[11px] uppercase text-neutral-300 hover:text-white sharp-transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deploying ? 'Deploying...' : 'Quick Seed Live Demo Scene'}
          </button>
        </div>

      </div>

    </div>
  );
};
