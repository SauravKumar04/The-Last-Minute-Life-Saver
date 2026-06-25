import { Task } from '../models/Task';
import { AgentLog } from '../models/AgentLog';
import { GoogleGenAI } from '@google/genai';

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

async function generateRescueAction(task: any): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return `[Aegis Autonomous Recovery Service]
Subject: EXTREME URGENCY: Assistance Required / Request for Extension on "${task.title}"

Dear Team,

I am writing to initiate a protocol rescue flag for "${task.title}". Due to current temporal constraints, I require additional support or a brief 24-hour delivery extension to complete final compliance and validation checks.

Mitigation Plan:
1. Immediate triage of critical blocks.
2. Delegate verification sub-tasks to available team members.
3. Consolidate logs and final delivery assets by tomorrow morning.

Thank you for your immediate coordination.

Best regards,
Aegis Dynamic Recovery Agent`;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const prompt = `You are Aegis, an elite autonomous AI task-rescue agent.
A critical task has breached its 12-hour temporal safe zone and needs immediate intervention.

Task Name: "${task.title}"
Original Priority: ${task.originalPriority}
Task Description/Notes: "${task.notes || 'No notes provided'}"

Generate a professional, highly polished mitigation plan or email draft requesting an extension or delegation of sub-tasks.
Start directly with the plan title, formatted clearly in plain text. Keep the tone clinical, modern, Vercel-like, and highly corporate. Do not include markdown preamble or conversational filler.`;

  // Try primary model gemini-3.5-flash first
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    if (response && response.text) {
      return response.text;
    }
  } catch (err: any) {
    console.warn('[Aegis Engine] Failed primary plan generation via gemini-3.5-flash:', err.message || err);
  }

  // Fallback model gemini-3.1-flash-lite if primary is overloaded (503) or unavailable
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });
    if (response && response.text) {
      return response.text;
    }
  } catch (err: any) {
    console.error('[Aegis Engine] Failed fallback plan generation via gemini-3.1-flash-lite:', err.message || err);
  }

  // Ultimate static rescue fallback
  return `[Aegis Emergency Rescue Mode]
Task "${task.title}" has breached the 12-hour safety threshold.
Mitigation Advice: Stop all secondary development and execute immediate code freeze. Prepare submission files immediately.`;
}

export async function recalculateScores() {
  if (isRunning) return;
  isRunning = true;

  try {
    const tasks = await Task.find();
    const now = new Date();

    for (const task of tasks) {
      // Completed or previously rescued tasks keep a status-based score
      if (task.status === 'completed') {
        if (task.dynamicScore !== 0) {
          await Task.findByIdAndUpdate(task._id, { dynamicScore: 0 });
        }
        continue;
      }

      const deadline = new Date(task.deadline);
      if (isNaN(deadline.getTime())) {
        console.warn(`[Aegis Engine] Skipping calculation for task "${task.title}" with invalid deadline: "${task.deadline}"`);
        continue;
      }
      const diffMs = deadline.getTime() - now.getTime();
      const hoursRemaining = diffMs / (1000 * 60 * 60);

      let dynamicScore = 0;
      if (hoursRemaining <= 0) {
        dynamicScore = 100; // Past due
      } else {
        // Core formula: scaling score over a 48-hour horizon
        const urgencyScore = Math.max(0, Math.min(100, (1 - (hoursRemaining / 48)) * 80));
        const priorityWeight = task.originalPriority === 'high' ? 20 : task.originalPriority === 'medium' ? 10 : 0;
        dynamicScore = Math.round(urgencyScore + priorityWeight);
        dynamicScore = Math.max(0, Math.min(100, dynamicScore));
      }

      const oldScore = task.dynamicScore;
      const updates: any = { dynamicScore };

      // Check for 12-hour threshold on pending tasks
      if (hoursRemaining > 0 && hoursRemaining < 12 && task.status === 'pending') {
        await AgentLog.create({
          message: `CRITICAL: "${task.title}" has breached the 12-hour safety limit (${hoursRemaining.toFixed(1)}h remaining). Triggering autonomous mitigation engine...`,
          type: 'warning',
          taskId: task._id,
          taskTitle: task.title
        });

        const plan = await generateRescueAction(task);
        updates.rescueAction = plan;
        updates.status = 'rescued'; // Automatically elevate state to 'rescued'

        await AgentLog.create({
          message: `Autonomous Rescue Plan generated for "${task.title}": Plan activated and delivered to staging.`,
          type: 'action',
          taskId: task._id,
          taskTitle: task.title
        });
      } else if (dynamicScore !== oldScore) {
        // Log general temporal risk updates if the change is significant
        if (Math.abs(dynamicScore - oldScore) >= 2) {
          await AgentLog.create({
            message: `Temporal calculation: "${task.title}" risk increased to ${dynamicScore}% (${hoursRemaining.toFixed(1)}h remaining).`,
            type: dynamicScore > 75 ? 'warning' : 'info',
            taskId: task._id,
            taskTitle: task.title
          });
        }
      }

      await Task.findByIdAndUpdate(task._id, updates);
    }
  } catch (err) {
    console.error('Error inside PriorityEngine update loop:', err);
  } finally {
    isRunning = false;
  }
}

export function startPriorityEngine() {
  if (intervalId) return;

  // Run initial calculation
  recalculateScores();

  // Run update loop every 15 seconds to keep dashboard state real-time and hyper-active
  intervalId = setInterval(() => {
    recalculateScores();
  }, 15000);

  console.log('[Aegis Engine] Priority Engine loop activated successfully.');
}

export function stopPriorityEngine() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Aegis Engine] Priority Engine loop deactivated.');
  }
}
