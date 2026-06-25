import { Request, Response, NextFunction } from 'express';
import { dbService } from '../services/dbService';
import { AgentLog } from '../models/AgentLog';

export const HabitController = {
  async getHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const habits = dbService.getHabits();
      res.json(habits);
    } catch (err) {
      next(err);
    }
  },

  async createHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ error: 'Habit name is required.' });
        return;
      }
      const newHabit = dbService.createHabit(name.trim());
      
      await AgentLog.create({
        message: `Registered new daily habit node: "${newHabit.name}". Tracking streak...`,
        type: 'success'
      });

      res.json(newHabit);
    } catch (err) {
      next(err);
    }
  },

  async toggleHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = dbService.toggleHabit(id);
      if (!updated) {
        res.status(404).json({ error: 'Habit not found.' });
        return;
      }

      await AgentLog.create({
        message: `Habit state toggled: "${updated.name}" is now ${updated.completedToday ? 'COMPLETED' : 'PENDING'}. Streak index: ${updated.streak} days.`,
        type: updated.completedToday ? 'success' : 'warning'
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const success = dbService.deleteHabit(id);
      if (!success) {
        res.status(404).json({ error: 'Habit not found.' });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};
