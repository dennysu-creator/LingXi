import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheck } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import petRoutes from './routes/pet';
import aiRoutes from './routes/ai';
import subscriptionRoutes from './routes/subscription';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// ═══════════════════════════════════════
// Global Middleware
// ═══════════════════════════════════════

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please slow down' },
});

// ═══════════════════════════════════════
// Health Check
// ═══════════════════════════════════════

app.get('/health', async (_req, res) => {
  const dbHealthy = await healthCheck();
  const status = dbHealthy ? 'healthy' : 'degraded';
  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: dbHealthy ? 'connected' : 'disconnected',
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'LingXi API',
    version: '1.0.0',
    status: 'running',
  });
});

// ═══════════════════════════════════════
// Route Mounting
// ═══════════════════════════════════════

app.use('/auth', authLimiter, authRoutes);
app.use('/user', userRoutes);
app.use('/pet', petRoutes);
app.use('/ai', aiLimiter, aiRoutes);
app.use('/', subscriptionRoutes);

// ═══════════════════════════════════════
// 404 Handler
// ═══════════════════════════════════════

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ═══════════════════════════════════════
// Global Error Handler
// ═══════════════════════════════════════

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err.message);
    console.error(err.stack);

    res.status(500).json({
      error:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
    });
  }
);

// ═══════════════════════════════════════
// Server Start
// ═══════════════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LingXi API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
