export interface Task {
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

export interface AgentLog {
  _id: string;
  message: string;
  timestamp: string; // ISO String
  type: 'info' | 'warning' | 'success' | 'action';
  taskId?: string;
  taskTitle?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  completed: number;
  rescued: number;
  averageRisk: number;
}

export interface Habit {
  _id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  lastCompleted?: string; // ISO String
}

export interface ScheduleBlock {
  time: string;
  activity: string;
  details: string;
}
