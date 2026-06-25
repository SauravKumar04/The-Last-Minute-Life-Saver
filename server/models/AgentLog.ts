import mongoose, { Schema } from 'mongoose';
import { dbService } from '../services/dbService';

const agentLogSchema = new Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['info', 'warning', 'success', 'action'], default: 'info' },
  taskId: { type: String },
  taskTitle: { type: String }
});

const MongoAgentLog = (mongoose.models.AgentLog || mongoose.model('AgentLog', agentLogSchema)) as any;

export class AgentLog {
  private static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  static async find(): Promise<any[]> {
    if (this.isConnected()) {
      try {
        return await MongoAgentLog.find({}).sort({ timestamp: -1 }).lean();
      } catch (e) {
        console.warn('MongoDB log find failed, falling back:', e);
      }
    }
    return dbService.getLogs();
  }

  static async create(data: {
    message: string;
    type: 'info' | 'warning' | 'success' | 'action';
    taskId?: string;
    taskTitle?: string;
  }): Promise<any> {
    if (this.isConnected()) {
      try {
        const created = await MongoAgentLog.create(data);
        return created.toObject();
      } catch (e) {
        console.warn('MongoDB log create failed, falling back:', e);
      }
    }
    return dbService.createLog(data);
  }

  static async deleteMany(): Promise<{ acknowledged: boolean; deletedCount: number }> {
    if (this.isConnected()) {
      try {
        const res = await MongoAgentLog.deleteMany({});
        return { acknowledged: res.acknowledged, deletedCount: res.deletedCount };
      } catch (e) {
        console.warn('MongoDB log delete failed, falling back:', e);
      }
    }
    dbService.clearLogs();
    return { acknowledged: true, deletedCount: 999 };
  }
}
