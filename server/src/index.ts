import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
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

// Cloud Run runs behind a load balancer — trust proxy for rate-limiting
app.set('trust proxy', 1);

// ═══════════════════════════════════════
// Process Error Handlers
// ═══════════════════════════════════════

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// ═══════════════════════════════════════
// Global Middleware
// ═══════════════════════════════════════

app.use(helmet());

// Static files (after helmet so security headers apply)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Idempotency-Key',
      'X-Device-Key',
      'X-Device-Platform',
      'X-Attestation-Token',
    ],
    maxAge: 86400,
  })
);

// Capture the raw request body so webhook HMAC signature verification
// can work AFTER JSON parsing. Extends Express Request with `rawBody`.
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody = buf.toString('utf8');
    },
  })
);
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
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Internal server error',
    });
  }
);

// ═══════════════════════════════════════
// Server Start
// ═══════════════════════════════════════

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`LingXi API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown for Cloud Run SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
