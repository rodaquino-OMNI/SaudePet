import { Router, Request, Response } from 'express';
import { messageQueue } from '../queues';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Basic health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Check queue connection
    const queueReady = await messageQueue.isReady();

    if (!queueReady) {
      logger.warn('Health check failed: queue not ready');
      return res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          queue: 'not ready',
        },
      });
    }

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'whatsapp-handler',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

/**
 * Detailed health check with all dependencies
 */
router.get('/health/detailed', async (_req: Request, res: Response) => {
  const checks: Record<string, 'healthy' | 'unhealthy' | 'degraded'> = {};
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

  // Check message queue
  try {
    const queueReady = await messageQueue.isReady();
    const jobCounts = await messageQueue.getJobCounts();

    checks['redis/queue'] = queueReady ? 'healthy' : 'unhealthy';

    // Warn if queue is backing up
    if (jobCounts.waiting > 1000 || jobCounts.active > 100) {
      checks['queue/backlog'] = 'degraded';
      overallStatus = 'degraded';
    } else {
      checks['queue/backlog'] = 'healthy';
    }
  } catch (error) {
    checks['redis/queue'] = 'unhealthy';
    overallStatus = 'unhealthy';
  }

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: 'whatsapp-handler',
    version: process.env.npm_package_version || '1.0.0',
    checks,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * Liveness probe for Kubernetes/ECS
 */
router.get('/health/live', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'live' });
});

/**
 * Readiness probe for Kubernetes/ECS
 */
router.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    const queueReady = await messageQueue.isReady();

    if (!queueReady) {
      return res.status(503).json({ status: 'not ready', reason: 'queue not connected' });
    }

    return res.status(200).json({ status: 'ready' });
  } catch (error) {
    return res.status(503).json({ status: 'not ready', reason: 'check failed' });
  }
});

export default router;
