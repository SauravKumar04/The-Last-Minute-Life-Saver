import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface ITask {
  _id: string;
  title: string;
  deadline: string; // ISO String
  originalPriority: 'low' | 'medium' | 'high';
  dynamicScore: number; // 0 to 100
  status: 'pending' | 'completed' | 'rescued';
  notes: string;
  rescueAction?: string;
  createdAt: string;
}

export interface IAgentLog {
  _id: string;
  message: string;
  timestamp: string; // ISO String
  type: 'info' | 'warning' | 'success' | 'action';
  taskId?: string;
  taskTitle?: string;
}

export interface IHabit {
  _id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  lastCompleted?: string; // ISO String
}

interface IDB {
  tasks: ITask[];
  logs: IAgentLog[];
  habits?: IHabit[];
}

function initDb(): IDB {
  const defaultHabits: IHabit[] = [];

  const initial: IDB = {
    tasks: [],
    logs: [
      {
        _id: 'log-1',
        message: 'Aegis Autonomous System Initialized: Ready to monitor temporal risk limits.',
        timestamp: new Date().toISOString(),
        type: 'info'
      }
    ],
    habits: defaultHabits
  };

  // Overwrite database to completely strip existing mock data for the user
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  } catch (err) {
    console.error('Failed to initialize pristine DB file:', err);
    return { tasks: [], logs: [], habits: [] };
  }
}

// Global active database state
let db = initDb();

function save(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

export const dbService = {
  // Task operations
  getTasks: (): ITask[] => {
    return db.tasks;
  },

  getTaskById: (id: string): ITask | undefined => {
    return db.tasks.find(t => t._id === id);
  },

  createTask: (taskData: Omit<ITask, '_id' | 'dynamicScore' | 'createdAt'>): ITask => {
    const newTask: ITask = {
      ...taskData,
      _id: 'task_' + Math.random().toString(36).substring(2, 11),
      dynamicScore: 0,
      createdAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    save();
    return newTask;
  },

  updateTask: (id: string, updates: Partial<ITask>): ITask | null => {
    const idx = db.tasks.findIndex(t => t._id === id);
    if (idx === -1) return null;
    db.tasks[idx] = { ...db.tasks[idx], ...updates };
    save();
    return db.tasks[idx];
  },

  deleteTask: (id: string): boolean => {
    const initialLen = db.tasks.length;
    db.tasks = db.tasks.filter(t => t._id !== id);
    if (db.tasks.length !== initialLen) {
      save();
      return true;
    }
    return false;
  },

  // Log operations
  getLogs: (): IAgentLog[] => {
    return db.logs;
  },

  createLog: (logData: Omit<IAgentLog, '_id' | 'timestamp'>): IAgentLog => {
    const newLog: IAgentLog = {
      ...logData,
      _id: 'log_' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString()
    };
    db.logs.unshift(newLog); // Prepend so new logs appear at top
    // Limit logs list size to 200 items for performance
    if (db.logs.length > 200) {
      db.logs = db.logs.slice(0, 200);
    }
    save();
    return newLog;
  },

  clearLogs: (): void => {
    db.logs = [];
    save();
  },

  // Habit operations
  getHabits: (): IHabit[] => {
    return db.habits || [];
  },

  createHabit: (name: string): IHabit => {
    const newHabit: IHabit = {
      _id: 'habit_' + Math.random().toString(36).substring(2, 11),
      name,
      streak: 0,
      completedToday: false
    };
    if (!db.habits) db.habits = [];
    db.habits.push(newHabit);
    save();
    return newHabit;
  },

  toggleHabit: (id: string): IHabit | null => {
    if (!db.habits) db.habits = [];
    const idx = db.habits.findIndex(h => h._id === id);
    if (idx === -1) return null;
    const h = db.habits[idx];
    if (h.completedToday) {
      h.completedToday = false;
      h.streak = Math.max(0, h.streak - 1);
    } else {
      h.completedToday = true;
      h.streak += 1;
      h.lastCompleted = new Date().toISOString();
    }
    save();
    return h;
  },

  deleteHabit: (id: string): boolean => {
    if (!db.habits) return false;
    const initialLen = db.habits.length;
    db.habits = db.habits.filter(h => h._id !== id);
    if (db.habits.length !== initialLen) {
      save();
      return true;
    }
    return false;
  }
};
