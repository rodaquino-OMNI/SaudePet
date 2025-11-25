import { Job } from 'bull';
import { MessageJobData } from '../queues/message.queue';
import { sessionService } from '../services/session.service';
import { flowEngine } from '../flows/engine';
import { whatsappClient } from '../clients/whatsapp.client';
import { logger } from '../utils/logger';
import { WhatsAppMessage, MessageContent, WhatsAppOutboundMessage } from '../types/whatsapp';

/**
 * Process an incoming WhatsApp message
 */
export async function processMessage(job: Job<MessageJobData>): Promise<void> {
  const { message, contact, metadata } = job.data;

  const requestLogger = logger.child({
    messageId: message.id,
    phoneNumber: `${message.from.slice(0, 4)}****`,
  });

  requestLogger.info('Processing message', {
    type: message.type,
    hasContact: !!contact,
  });

  try {
    // Get or create session
    const session = await sessionService.getOrCreate(message.from, {
      contactName: contact?.profile?.name,
      phoneNumberId: metadata.phone_number_id,
    });

    requestLogger.debug('Session retrieved', {
      sessionId: session.id,
      hasUserId: !!session.userId,
      currentFlow: session.state.currentFlow,
    });

    // Extract message content based on type
    const content = extractContent(message);

    requestLogger.debug('Content extracted', {
      contentType: content.type,
      hasText: !!content.text,
    });

    // Process through flow engine
    const response = await flowEngine.process({
      session,
      messageType: message.type,
      content,
      messageId: message.id,
    });

    requestLogger.debug('Flow engine response', {
      messagesCount: response.messages.length,
      newFlow: response.newState.currentFlow,
    });

    // Send response messages
    for (const responseMessage of response.messages) {
      await sendResponse(message.from, responseMessage, requestLogger);

      // Add small delay between messages to maintain order
      await sleep(100);
    }

    // Update session state
    await sessionService.update(session.id, response.newState);

    requestLogger.info('Message processed successfully', {
      responsesSent: response.messages.length,
    });
  } catch (error) {
    requestLogger.error('Error processing message', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Send error message to user
    try {
      await whatsappClient.sendText(
        message.from,
        'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.'
      );
    } catch (sendError) {
      requestLogger.error('Failed to send error message', {
        error: sendError instanceof Error ? sendError.message : 'Unknown error',
      });
    }

    throw error;
  }
}

/**
 * Extract content from WhatsApp message based on type
 */
function extractContent(message: WhatsAppMessage): MessageContent {
  switch (message.type) {
    case 'text':
      return {
        type: 'text',
        text: message.text?.body || '',
      };

    case 'image':
      return {
        type: 'image',
        mediaId: message.image?.id,
        mimeType: message.image?.mime_type,
        caption: message.image?.caption,
      };

    case 'document':
      return {
        type: 'document',
        mediaId: message.document?.id,
        mimeType: message.document?.mime_type,
        filename: message.document?.filename,
        caption: message.document?.caption,
      };

    case 'audio':
      return {
        type: 'audio',
        mediaId: message.audio?.id,
        mimeType: message.audio?.mime_type,
      };

    case 'video':
      return {
        type: 'video',
        mediaId: message.video?.id,
        mimeType: message.video?.mime_type,
        caption: message.video?.caption,
      };

    case 'location':
      return {
        type: 'location',
        latitude: message.location?.latitude,
        longitude: message.location?.longitude,
      };

    case 'interactive':
      if (message.interactive?.type === 'button_reply') {
        return {
          type: 'button',
          buttonId: message.interactive.button_reply?.id,
          buttonText: message.interactive.button_reply?.title,
        };
      }
      if (message.interactive?.type === 'list_reply') {
        return {
          type: 'list',
          listId: message.interactive.list_reply?.id,
          listTitle: message.interactive.list_reply?.title,
        };
      }
      return { type: 'unknown' };

    case 'button':
      return {
        type: 'button',
        buttonId: message.button?.payload,
        buttonText: message.button?.text,
      };

    default:
      return { type: 'unknown' };
  }
}

/**
 * Send a response message to WhatsApp
 */
async function sendResponse(
  to: string,
  message: WhatsAppOutboundMessage,
  requestLogger: typeof logger
): Promise<void> {
  try {
    switch (message.type) {
      case 'text':
        await whatsappClient.sendText(to, message.text || '');
        break;

      case 'interactive':
        if (message.interactive) {
          await whatsappClient.sendInteractive(to, message.interactive);
        }
        break;

      case 'image':
        if (message.image) {
          await whatsappClient.sendImage(to, message.image.url, message.image.caption);
        }
        break;

      case 'document':
        if (message.document) {
          await whatsappClient.sendDocument(
            to,
            message.document.url,
            message.document.filename,
            message.document.caption
          );
        }
        break;

      case 'template':
        if (message.template) {
          await whatsappClient.sendTemplate(to, message.template);
        }
        break;

      default:
        requestLogger.warn('Unknown message type', { type: message.type });
    }
  } catch (error) {
    requestLogger.error('Failed to send response', {
      type: message.type,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
