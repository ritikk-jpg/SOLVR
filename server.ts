/**
 * SOLVR Full-Stack Application Server
 * Express Backend + Vite Middleware (Dev) & Static Serving (Prod)
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { taskRouter } from './server/routes/tasks';
import { foodRescueRouter } from './server/routes/foodRescue';
import { workerRouter } from './server/routes/workers';
import { walletRouter } from './server/routes/wallets';
import { municipalRouter } from './server/routes/municipal';
import { dispatchRouter } from './server/routes/dispatch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API calls
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });

  // REST API Route Mounts
  app.use('/api/tasks', taskRouter);
  app.use('/api/food-rescues', foodRescueRouter);
  app.use('/api/workers', workerRouter);
  app.use('/api/wallets', walletRouter);
  app.use('/api/municipal', municipalRouter);
  app.use('/api/dispatch', dispatchRouter);

  // Health and System Diagnostics Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'HEALTHY',
      service: 'SOLVR Civic Logistics & Food Rescue Core',
      version: '1.4.0',
      timestamp: new Date().toISOString(),
      modules: {
        civicMaintenanceEngine: 'ONLINE',
        foodRescueLogistics: 'ONLINE',
        gamificationStreakEngine: 'ONLINE',
        escrowLedgerWallet: 'ONLINE',
      },
    });
  });

  // Vite Integration
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[SOLVR Server] Vite development middleware mounted.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[SOLVR Server] Serving static build from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`  SOLVR Core Platform Online`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  API Base:  http://localhost:${PORT}/api`);
    console.log(`=========================================`);
  });
}

startServer().catch((err) => {
  console.error('[SOLVR Server] Fatal boot error:', err);
  process.exit(1);
});
