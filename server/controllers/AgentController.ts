import { Request, Response, NextFunction } from 'express';
import { AgentLog } from '../models/AgentLog';

export const AgentController = {
  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AgentLog.find();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  },

  async clearLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AgentLog.deleteMany();
      await AgentLog.create({
        message: 'Terminal logs cleared. Aegis core surveillance engine active.',
        type: 'info'
      });
      const logs = await AgentLog.find();
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }
};
