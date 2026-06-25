import mongoose, { Schema } from 'mongoose';
import { dbService } from '../services/dbService';

const taskSchema = new Schema({
  title: { type: String, required: true },
  deadline: { type: Date, required: true },
  originalPriority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  dynamicScore: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'rescued'], default: 'pending' },
  notes: { type: String, default: '' },
  rescueAction: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MongoTask = (mongoose.models.Task || mongoose.model('Task', taskSchema)) as any;

export class Task {
  private static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  static async find(): Promise<any[]> {
    if (this.isConnected()) {
      try {
        return await MongoTask.find({}).sort({ deadline: 1 }).lean();
      } catch (e) {
        console.warn('MongoDB task query failed, falling back:', e);
      }
    }
    return dbService.getTasks();
  }

  static async findById(id: string): Promise<any | null> {
    if (this.isConnected()) {
      try {
        return await MongoTask.findById(id).lean();
      } catch (e) {
        console.warn('MongoDB task query by ID failed, falling back:', e);
      }
    }
    return dbService.getTaskById(id) || null;
  }

  static async create(data: {
    title: string;
    deadline: string;
    originalPriority: 'low' | 'medium' | 'high';
    notes: string;
    status?: 'pending' | 'completed' | 'rescued';
  }): Promise<any> {
    if (this.isConnected()) {
      try {
        const created = await MongoTask.create(data);
        return created.toObject();
      } catch (e) {
        console.warn('MongoDB task create failed, falling back:', e);
      }
    }
    return dbService.createTask({
      title: data.title,
      deadline: data.deadline,
      originalPriority: data.originalPriority,
      notes: data.notes,
      status: data.status || 'pending'
    });
  }

  static async findByIdAndUpdate(
    id: string,
    updates: any,
    options: any = { new: true }
  ): Promise<any | null> {
    if (this.isConnected()) {
      try {
        const updated = await MongoTask.findByIdAndUpdate(id, updates, options).lean();
        if (updated) return updated;
      } catch (e) {
        console.warn('MongoDB task update failed, falling back:', e);
      }
    }
    return dbService.updateTask(id, updates);
  }

  static async findByIdAndDelete(id: string): Promise<any | null> {
    if (this.isConnected()) {
      try {
        const deleted = await MongoTask.findByIdAndDelete(id).lean();
        if (deleted) return deleted;
      } catch (e) {
        console.warn('MongoDB task delete failed, falling back:', e);
      }
    }
    const success = dbService.deleteTask(id);
    return success ? { _id: id } : null;
  }
}
