import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Initialize Neon PostgreSQL Database Table asynchronously (non-blocking)
  

  // API Route: Database Health Check
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Ruta de API no encontrada: ${req.method} ${req.path}`
    });
  });

  // Global Express Error Handler for API requests (guarantees JSON output)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Express Error Handler:', err);
    if (req.path.startsWith('/api') || req.headers['content-type']?.includes('json')) {
      return res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno en la API de la base de datos'
      });
    }
    next(err);
  });

  // Vite middleware in development
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT} with Neon PostgreSQL integration`);
  });
}

startServer();

