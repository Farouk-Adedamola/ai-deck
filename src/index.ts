import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errors';
import { initializeDatabase } from './config/database';
import callRoutes from './routes/calls';
import webhookRoutes from './routes/webhooks';
import nkiruRoutes from './routes/nkiru';
import { config } from './config';

// Load environment variables
dotenv.config();

const app: express.Application = express();
const PORT = config.port || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nkiru-call-micro',
  });
});

// API Routes
app.use('/api/v1/calls', callRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api/v1/nkiru', nkiruRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        environment: config.nodeEnv,
        port: PORT,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

startServer();

export default app;
