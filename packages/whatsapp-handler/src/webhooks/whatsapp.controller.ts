import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config';
import { messageQueue } from '../queues/message.queue';
import { logger } from '../utils/logger';
import { WhatsAppWebhookPayload, WhatsAppMessage, WhatsAppContact } from '../types/whatsapp';

const router = Router();

/**
 * Webhook verification endpoint (GET)
 * Called by Meta to verify the webhook URL
 */
router.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  logger.info('Webhook verification request', { mode, hasToken: !!token });

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    logger.info('WhatsApp webhook verified successfully');
    return res.status(200).send(challenge);
  }

  logger.warn('WhatsApp webhook verification failed', {
    expectedMode: 'subscribe',
    receivedMode: mode,
    tokenMatch: token === config.whatsapp.verifyToken,
  });

  return res.sendStatus(403);
});

/**
 * Webhook receiver endpoint (POST)
 * Receives incoming messages from WhatsApp
 */
router.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  const startTime = Date.now();

  // Validate signature
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!validateSignature(req, signature)) {
    logger.warn('Invalid webhook signature');
    return res.sendStatus(401);
  }

  // Acknowledge immediately (Meta requires <20s response)
  res.sendStatus(200);

  // Process asynchronously
  try {
    const payload = req.body as WhatsAppWebhookPayload;

    if (payload.object !== 'whatsapp_business_account') {
      logger.debug('Ignoring non-WhatsApp webhook', { object: payload.object });
      return;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') {
          continue;
        }

        const { messages, contacts, metadata } = change.value;

        // Handle status updates
        if (change.value.statuses) {
          for (const status of change.value.statuses) {
            logger.debug('Message status update', {
              messageId: status.id,
              status: status.status,
              recipientId: status.recipient_id,
            });
          }
          continue;
        }

        // Process incoming messages
        if (messages && messages.length > 0) {
          for (const message of messages) {
            await queueMessage(message, contacts?.[0], metadata);
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Webhook processed', { duration, messagesQueued: true });
  } catch (error) {
    logger.error('Error processing webhook', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Validate the webhook signature from Meta
 */
function validateSignature(req: Request, signature: string): boolean {
  if (!signature) {
    return false;
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    logger.warn('Raw body not available for signature validation');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.whatsapp.appSecret)
    .update(rawBody)
    .digest('hex');

  const isValid = signature === `sha256=${expectedSignature}`;

  if (!isValid) {
    logger.warn('Signature mismatch', {
      received: signature.substring(0, 20) + '...',
      expected: `sha256=${expectedSignature.substring(0, 15)}...`,
    });
  }

  return isValid;
}

/**
 * Queue a message for async processing
 */
async function queueMessage(
  message: WhatsAppMessage,
  contact: WhatsAppContact | undefined,
  metadata: { display_phone_number: string; phone_number_id: string }
) {
  logger.info('Queuing message for processing', {
    messageId: message.id,
    from: `${message.from.slice(0, 4)}****`,
    type: message.type,
  });

  await messageQueue.add(
    'process-message',
    {
      message,
      contact,
      metadata,
      receivedAt: new Date().toISOString(),
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    }
  );
}

export default router;
