import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { GoogleGenAI } from '@google/genai';

// Simple backend cache to prevent rate-limiting (429) errors from rapid polls
const cache = {
  recommendations: {
    data: [] as string[],
    timestamp: 0,
    fingerprint: ''
  },
  schedule: {
    data: [] as any[],
    timestamp: 0,
    fingerprint: ''
  }
};
const COOLDOWN_MS = 45000; // 45 seconds cooldown between real LLM generations

export const RecommendationController = {
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await Task.find();
      const pendingTasks = tasks.filter(t => t.status !== 'completed');

      if (pendingTasks.length === 0) {
        res.json({
          recommendations: [
            "All temporal boundaries de-escalated. Ledger is clear.",
            "Great job keeping your task list completely green. Perfect surveillance score.",
            "Recommendation: Seed or create new boundaries to test dynamic priority sweeps."
          ]
        });
        return;
      }

      const fingerprint = pendingTasks.map(t => `${t._id}:${t.status}`).join(',');
      const now = Date.now();

      // Check cache validity (fingerprint matches and cooldown is active)
      if (cache.recommendations.fingerprint === fingerprint && (now - cache.recommendations.timestamp) < COOLDOWN_MS) {
        console.log('[Aegis Recommendations] Serving from cache (Fingerprint match & Cooldown active)');
        res.json({ recommendations: cache.recommendations.data });
        return;
      }

      // General throttle: if we made a real API call less than 15 seconds ago, reuse cache/static to avoid rate spikes
      if (cache.recommendations.timestamp > 0 && (now - cache.recommendations.timestamp) < 15000) {
        console.log('[Aegis Recommendations] Serving from cache (General throttle 15s)');
        res.json({ 
          recommendations: cache.recommendations.data.length > 0 
            ? cache.recommendations.data 
            : generateStaticRecommendations(pendingTasks) 
        });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        res.json({
          recommendations: generateStaticRecommendations(pendingTasks)
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const taskSummary = pendingTasks.map(t => `- "${t.title}" (Original priority: ${t.originalPriority}, Dynamic priority index: ${t.dynamicScore}%)`).join('\n');
      const prompt = `You are Aegis, a highly advanced corporate productivity defense engine.
Analyze the following list of pending task boundaries:
${taskSummary}

Generate exactly 3 bullet-pointed, clinical, Vercel-style, ultra-modern recommendations to optimize the user's focus and de-escalate their temporal risks.
Format instructions:
- Return ONLY the 3 bullet points, each starting with "- ".
- Keep each point under 120 characters.
- Tone must be precise, professional, cybernetic, and corporate.
- Do not use markdown bolding inside the bullet lines. Keep them completely flat text.`;

      // Try primary model
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (response && response.text) {
          const lines = response.text
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.startsWith('-') || l.startsWith('*') || l.match(/^\d+\./))
            .map(l => l.replace(/^[-*\d.]+\s*/, ''));
          
          if (lines.length >= 3) {
            cache.recommendations.data = lines.slice(0, 3);
            cache.recommendations.timestamp = Date.now();
            cache.recommendations.fingerprint = fingerprint;
            res.json({ recommendations: cache.recommendations.data });
            return;
          }
        }
      } catch (err: any) {
        console.warn('[Aegis Recommendations] Primary model failed, attempting fallback...', err.message || err);
      }

      // Try fallback model
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
        });

        if (response && response.text) {
          const lines = response.text
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.startsWith('-') || l.startsWith('*') || l.match(/^\d+\./))
            .map(l => l.replace(/^[-*\d.]+\s*/, ''));
          
          if (lines.length >= 3) {
            cache.recommendations.data = lines.slice(0, 3);
            cache.recommendations.timestamp = Date.now();
            cache.recommendations.fingerprint = fingerprint;
            res.json({ recommendations: cache.recommendations.data });
            return;
          }
        }
      } catch (err: any) {
        console.error('[Aegis Recommendations] Fallback model failed too.', err.message || err);
      }

      // If we failed all LLM requests, return cached value if we have any, or fall back to static
      const finalRecs = cache.recommendations.data.length > 0 
        ? cache.recommendations.data 
        : generateStaticRecommendations(pendingTasks);

      res.json({ recommendations: finalRecs });
    } catch (err) {
      next(err);
    }
  },

  async getSchedulePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await Task.find();
      const pendingTasks = tasks.filter(t => t.status !== 'completed');

      if (pendingTasks.length === 0) {
        res.json({
          schedule: [
            { time: "09:00 - 11:00", activity: "System Upkeep & Skill Sandbox", details: "All boundaries are clear. Standard core maintenance." }
          ]
        });
        return;
      }

      const fingerprint = pendingTasks.map(t => `${t._id}:${t.status}`).join(',');
      const now = Date.now();

      // Check cache validity (fingerprint matches and cooldown is active)
      if (cache.schedule.fingerprint === fingerprint && (now - cache.schedule.timestamp) < COOLDOWN_MS) {
        console.log('[Aegis Schedule] Serving from cache (Fingerprint match & Cooldown active)');
        res.json({ schedule: cache.schedule.data });
        return;
      }

      // General throttle: if we made a real API call less than 15 seconds ago, reuse cache/static to avoid rate spikes
      if (cache.schedule.timestamp > 0 && (now - cache.schedule.timestamp) < 15000) {
        console.log('[Aegis Schedule] Serving from cache (General throttle 15s)');
        res.json({ 
          schedule: cache.schedule.data.length > 0 
            ? cache.schedule.data 
            : generateStaticSchedule(pendingTasks) 
        });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        res.json({
          schedule: generateStaticSchedule(pendingTasks)
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const taskSummary = pendingTasks.map(t => `- "${t.title}" (Priority: ${t.originalPriority}, Risk Index: ${t.dynamicScore}%)`).join('\n');
      const prompt = `You are Aegis, an elite corporate scheduling advisor.
Analyze the following pending boundaries:
${taskSummary}

Plan an optimized 3-block sequence of time allocations for today.
Format your output strictly as a JSON array matching this typescript interface:
interface Block {
  time: string; // e.g., "09:00 - 11:00"
  activity: string; // e.g., "Deep Focus: [Task Title]"
  details: string; // concise high-level subtask planning advice
}

Return ONLY raw JSON, with no markdown backticks, no prefix, and no conversational filler. Make sure it is valid JSON.`;

      // Try primary model
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (response && response.text) {
          const rawText = response.text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed)) {
            cache.schedule.data = parsed.slice(0, 4);
            cache.schedule.timestamp = Date.now();
            cache.schedule.fingerprint = fingerprint;
            res.json({ schedule: cache.schedule.data });
            return;
          }
        }
      } catch (err: any) {
        console.warn('[Aegis Schedule] Primary model failed, trying fallback...', err.message || err);
      }

      // Try fallback model
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
        });

        if (response && response.text) {
          const rawText = response.text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed)) {
            cache.schedule.data = parsed.slice(0, 4);
            cache.schedule.timestamp = Date.now();
            cache.schedule.fingerprint = fingerprint;
            res.json({ schedule: cache.schedule.data });
            return;
          }
        }
      } catch (err: any) {
        console.error('[Aegis Schedule] Fallback model failed too.', err.message || err);
      }

      // Fallback
      const finalSchedule = cache.schedule.data.length > 0 
        ? cache.schedule.data 
        : generateStaticSchedule(pendingTasks);

      res.json({ schedule: finalSchedule });
    } catch (err) {
      next(err);
    }
  }
};

function generateStaticRecommendations(pendingTasks: any[]): string[] {
  const highRisk = pendingTasks.filter(t => t.dynamicScore > 75);
  const mediumRisk = pendingTasks.filter(t => t.dynamicScore > 40 && t.dynamicScore <= 75);

  const list: string[] = [];
  if (highRisk.length > 0) {
    list.push(`Triage immediate assistance: "${highRisk[0].title}" has entered the critical risk threshold. Execute mitigation blueprint immediately.`);
  } else {
    list.push("Consolidated block-times: Dedicate the first 90 minutes of the day to proactive boundary checks to secure high-priority deliverables.");
  }

  if (mediumRisk.length > 0) {
    list.push(`Pre-emptive delegation: Consider scheduling sub-task delegations for "${mediumRisk[0].title}" to prevent downstream buffer compression.`);
  } else {
    list.push("Interval tracking: Ensure regular checkpoint reviews of medium-priority nodes to prevent dynamic score escalation.");
  }

  list.push("Habit alignment: Cross-verify outstanding deliverables with active daily focus zones to maximize peak cognitive performance.");
  return list.slice(0, 3);
}

function generateStaticSchedule(pendingTasks: any[]) {
  const sorted = [...pendingTasks].sort((a, b) => b.dynamicScore - a.dynamicScore);
  const blocks = [];

  if (sorted[0]) {
    blocks.push({
      time: "09:00 - 11:30",
      activity: `Deep Focus: ${sorted[0].title}`,
      details: "Execute the critical core requirements. Eliminate all notifications and environmental distractions."
    });
  }

  if (sorted[1]) {
    blocks.push({
      time: "13:00 - 14:30",
      activity: `Mitigation & Verification: ${sorted[1].title}`,
      details: "Tackle outstanding secondary blocks. Perform testing and run code audits before integration."
    });
  } else {
    blocks.push({
      time: "13:00 - 14:30",
      activity: "Skill Sandbox & Maintenance",
      details: "Investigate performance optimization parameters, review server telemetry logs, or clear technical debt."
    });
  }

  blocks.push({
    time: "16:00 - 17:00",
    activity: "Daily Standup & Integration Sweep",
    details: "Coordinate with the team to resolve blockages. Complete daily habit nodes and secure de-escalated status."
  });

  return blocks;
}
