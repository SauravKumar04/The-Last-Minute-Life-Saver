import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, AgentLog, DashboardStats, Habit } from '../types';

interface AppContextProps {
  tasks: Task[];
  logs: AgentLog[];
  habits: Habit[];
  loadingTasks: boolean;
  loadingLogs: boolean;
  loadingHabits: boolean;
  syncing: boolean;
  activeTab: 'landing' | 'dashboard' | 'logs' | 'settings';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'logs' | 'settings') => void;
  fetchTasks: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchHabits: () => Promise<void>;
  createTask: (data: {
    title: string;
    deadline: string;
    originalPriority: 'low' | 'medium' | 'high';
    notes: string;
  }) => Promise<boolean>;
  updateTaskStatus: (id: string, status: 'pending' | 'completed' | 'rescued') => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  syncWithGoogle: () => Promise<void>;
  clearTerminalLogs: () => Promise<void>;
  createHabit: (name: string) => Promise<boolean>;
  toggleHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  stats: DashboardStats;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'logs' | 'settings'>('landing');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoadingHabits(false);
    }
  }, []);

  const createTask = async (data: {
    title: string;
    deadline: string;
    originalPriority: 'low' | 'medium' | 'high';
    notes: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchTasks();
        await fetchLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating task:', err);
      return false;
    }
  };

  const updateTaskStatus = async (id: string, status: 'pending' | 'completed' | 'rescued') => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchTasks();
        await fetchLogs();
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTasks();
        await fetchLogs();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const syncWithGoogle = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/tasks/sync', { method: 'POST' });
      if (res.ok) {
        await fetchLogs();
      }
    } catch (err) {
      console.error('Error syncing with Google Workspace:', err);
    } finally {
      setSyncing(false);
    }
  };

  const clearTerminalLogs = async () => {
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      if (res.ok) {
        const freshLogs = await res.json();
        setLogs(freshLogs);
      }
    } catch (err) {
      console.error('Error clearing terminal logs:', err);
    }
  };

  const createHabit = async (name: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await fetchHabits();
        await fetchLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating habit:', err);
      return false;
    }
  };

  const toggleHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}/toggle`, {
        method: 'PUT',
      });
      if (res.ok) {
        await fetchHabits();
        await fetchLogs();
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchHabits();
      }
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // Set up hot updates interval to fetch fresh stats, scores, and console outputs every 5 seconds
  useEffect(() => {
    fetchTasks();
    fetchLogs();
    fetchHabits();

    const interval = setInterval(() => {
      fetchTasks();
      fetchLogs();
      fetchHabits();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchTasks, fetchLogs, fetchHabits]);

  // Compute live statistics
  const getStats = (): DashboardStats => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const rescued = tasks.filter(t => t.status === 'rescued').length;

    // Average Risk index of active tasks (excluding fully completed nodes)
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const averageRisk = activeTasks.length > 0
      ? Math.round(activeTasks.reduce((sum, t) => sum + t.dynamicScore, 0) / activeTasks.length)
      : 0;

    return { total, pending, completed, rescued, averageRisk };
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        logs,
        habits,
        loadingTasks,
        loadingLogs,
        loadingHabits,
        syncing,
        activeTab,
        setActiveTab,
        fetchTasks,
        fetchLogs,
        fetchHabits,
        createTask,
        updateTaskStatus,
        deleteTask,
        syncWithGoogle,
        clearTerminalLogs,
        createHabit,
        toggleHabit,
        deleteHabit,
        stats: getStats(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
};
