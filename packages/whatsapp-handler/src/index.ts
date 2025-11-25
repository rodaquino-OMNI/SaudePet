import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './utils/logger';
import { config } from './config';
import whatsappWebhook from './webhooks/whatsapp.controller';
import healthRoutes from './routes/health';
import { initializeQueues } from './queues';

const app = express();

// Security middleware
app.use(helmet());

// Request logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Parse JSON bodies
app.use(express.json({
  verify: (req: any, _res, buf) => {
    // Store raw body for signature verification
    req.rawBody = buf;
  }
}));

// Health check routes
app.use(healthRoutes);

// WhatsApp webhook routes
app.use(whatsappWebhook);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize message processing queues
initializeQueues().then(() => {
  logger.info('Message queues initialized');
}).catch((err) => {
  logger.error('Failed to initialize queues', { error: err });
  process.exit(1);
});

// Start server
app.listen(config.port, () => {
  logger.info(`WhatsApp Handler running on port ${config.port}`, {
    environment: config.environment,
    nodeVersion: process.version
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
