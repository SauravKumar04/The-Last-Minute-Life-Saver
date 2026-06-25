import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { AgentLog } from '../models/AgentLog';
import { recalculateScores } from '../services/PriorityEngine';
import { GoogleSyncShim } from '../services/GoogleSyncShim';

export const TaskController = {
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await Task.find();
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, deadline, originalPriority, notes } = req.body;
      if (!title || !deadline || !originalPriority) {
        res.status(400).json({ error: 'Title, deadline, and originalPriority are required.' });
        return;
      }

      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        res.status(400).json({ error: 'Provided deadline is not a valid date/time.' });
        return;
      }

      const newTask = await Task.create({
        title,
        deadline: parsedDeadline.toISOString(),
        originalPriority,
        notes: notes || '',
        status: 'pending'
      });

      await AgentLog.create({
        message: `Registered tracking target "${title}" with safety classification "${originalPriority.toUpperCase()}".`,
        type: 'info',
        taskId: newTask._id,
        taskTitle: newTask.title
      });

      // Recalculate scores instantly for high-fidelity updates
      await recalculateScores();

      // Return the updated task from DB
      const result = await Task.findById(newTask._id);
      res.status(201).json(result || newTask);
    } catch (err) {
      next(err);
    }
  },

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const oldTask = await Task.findById(id);
      if (!oldTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      if (updates.deadline) {
        const parsedDeadline = new Date(updates.deadline);
        if (isNaN(parsedDeadline.getTime())) {
          res.status(400).json({ error: 'Provided deadline is not a valid date/time.' });
          return;
        }
        updates.deadline = parsedDeadline.toISOString();
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

      if (updates.status === 'completed' && oldTask.status !== 'completed') {
        await AgentLog.create({
          message: `DE-ESCALATED: Goal accomplished for "${updatedTask.title}". Monitoring deactivated, temporal risk index reset to 0%.`,
          type: 'success',
          taskId: updatedTask._id,
          taskTitle: updatedTask.title
        });
      } else if (updates.status === 'rescued' && oldTask.status !== 'rescued') {
        await AgentLog.create({
          message: `MITIGATION APPLIED: Manual rescue strategy initiated for "${updatedTask.title}". System holding tracking parameters.`,
          type: 'action',
          taskId: updatedTask._id,
          taskTitle: updatedTask.title
        });
      } else {
        await AgentLog.create({
          message: `Boundary modification: Configuration updated for task "${updatedTask.title}".`,
          type: 'info',
          taskId: updatedTask._id,
          taskTitle: updatedTask.title
        });
      }

      await recalculateScores();

      const result = await Task.findById(id);
      res.json(result || updatedTask);
    } catch (err) {
      next(err);
    }
  },

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      await Task.findByIdAndDelete(id);

      await AgentLog.create({
        message: `System Action: Ceased telemetry monitoring for "${task.title}". Node removed from scope.`,
        type: 'warning'
      });

      res.json({ message: 'Task removed successfully' });
    } catch (err) {
      next(err);
    }
  },

  async syncToGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await Task.find();
      const activeTasks = tasks.filter((t: any) => t.status !== 'completed');
      const result = await GoogleSyncShim.syncTasks(activeTasks);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};
