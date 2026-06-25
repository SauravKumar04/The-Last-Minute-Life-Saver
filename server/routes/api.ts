import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';
import { AgentController } from '../controllers/AgentController';
import { RecommendationController } from '../controllers/RecommendationController';
import { HabitController } from '../controllers/HabitController';

const router = Router();

// Core Task endpoints
router.get('/tasks', TaskController.getTasks);
router.post('/tasks', TaskController.createTask);
router.put('/tasks/:id', TaskController.updateTask);
router.delete('/tasks/:id', TaskController.deleteTask);
router.post('/tasks/sync', TaskController.syncToGoogle);

// Agent and Console Monitor endpoints
router.get('/logs', AgentController.getLogs);
router.post('/logs/clear', AgentController.clearLogs);

// Productivity and Habit endpoints
router.get('/recommendations', RecommendationController.getRecommendations);
router.get('/schedule', RecommendationController.getSchedulePlan);
router.get('/habits', HabitController.getHabits);
router.post('/habits', HabitController.createHabit);
router.put('/habits/:id/toggle', HabitController.toggleHabit);
router.delete('/habits/:id', HabitController.deleteHabit);

export default router;
