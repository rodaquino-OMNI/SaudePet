import Queue, { Job } from 'bull';
import { config } from '../config';
import { logger } from '../utils/logger';
import { processMessage } from '../handlers/message.handler';
import { WhatsAppMessage, WhatsAppContact } from '../types/whatsapp';

export interface MessageJobData {
  message: WhatsAppMessage;
  contact?: WhatsAppContact;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  receivedAt: string;
}

export const messageQueue = new Queue<MessageJobData>('whatsapp-messages', config.redis.url, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export async function initializeQueues(): Promise<void> {
  // Process messages
  messageQueue.process('process-message', async (job: Job<MessageJobData>) => {
    const startTime = Date.now();
    const { message } = job.data;

    logger.info('Processing message', {
      jobId: job.id,
      messageId: message.id,
      messageType: message.type,
    });

    try {
      await processMessage(job);

      const duration = Date.now() - startTime;
      logger.info('Message processed successfully', {
        jobId: job.id,
        messageId: message.id,
        duration,
      });
    } catch (error) {
      logger.error('Failed to process message', {
        jobId: job.id,
        messageId: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt: job.attemptsMade + 1,
        maxAttempts: job.opts.attempts,
      });
      throw error;
    }
  });

  // Queue event handlers
  messageQueue.on('completed', (job: Job) => {
    logger.debug('Job completed', { jobId: job.id });
  });

  messageQueue.on('failed', (job: Job, error: Error) => {
    logger.error('Job failed', {
      jobId: job?.id,
      error: error.message,
      attempts: job?.attemptsMade,
    });
  });

  messageQueue.on('stalled', (job: Job) => {
    logger.warn('Job stalled', { jobId: job.id });
  });

  messageQueue.on('error', (error: Error) => {
    logger.error('Queue error', { error: error.message });
  });

  // Verify queue connection
  await messageQueue.isReady();
  logger.info('Message queue connected and ready');
}

export async function closeQueues(): Promise<void> {
  await messageQueue.close();
  logger.info('Message queues closed');
}
