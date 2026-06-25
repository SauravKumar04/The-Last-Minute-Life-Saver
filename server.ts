import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api';
import { startPriorityEngine, stopPriorityEngine } from './server/services/PriorityEngine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Try to connect to MongoDB if a connection string is supplied
  const MONGODB_URI = process.env.MONGODB_URI || '';
  if (MONGODB_URI && MONGODB_URI !== 'MY_MONGODB_URI') {
    console.log('[Aegis Database] Connection string identified. Initiating Mongoose handshakes...');
    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log('[Aegis Database] MongoDB connected successfully via Mongoose.');
      })
      .catch((err) => {
        console.warn(
          `[Aegis Database] Mongoose handshake failed: ${err.message}. Aegis will fall back to high-fidelity persistent JSON storage.`
        );
      });
  } else {
    console.log('[Aegis Database] No MONGODB_URI found. Utilizing high-fidelity persistent local JSON system.');
  }

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'active', engine: 'PriorityEngine 1.0.0', db: mongoose.connection.readyState === 1 ? 'mongodb' : 'json-file' });
  });

  // Start the Priority Engine background analysis
  startPriorityEngine();

  // Vite Integration for Asset Serving
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Aegis Server] Development mode. Injecting Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Aegis Server] Production mode. Serving static bundles...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aegis Server] Core server active at http://localhost:${PORT}`);
  });

  // Handle graceful shutdowns
  process.on('SIGTERM', () => {
    console.log('[Aegis Server] SIGTERM signal received. Shutting down...');
    stopPriorityEngine();
    server.close(() => {
      mongoose.disconnect();
      console.log('[Aegis Server] Server clean exit complete.');
    });
  });
}

startServer().catch((err) => {
  console.error('[Aegis Server] Failed to initiate core system services:', err);
});
