import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';

// Import Routes
import apiRoutes from './server/routes/index';
import { errorHandler } from './server/middleware/errorHandler';

async function startServer() {
  const app = express();

  // ✅ PORT FIX (ONLY ONCE)
  const PORT = Number(process.env.PORT) || 10000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---
  app.use('/api', apiRoutes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error Handler
  app.use(errorHandler);

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ✅ FINAL LISTEN
  app.listen(PORT, '0.0.0.0', () => {
    console.log("PORT USED:", PORT);
  });
}

startServer();