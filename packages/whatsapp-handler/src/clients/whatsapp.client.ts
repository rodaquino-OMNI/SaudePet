import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  WhatsAppInteractiveMessage,
  WhatsAppTemplateMessage,
} from '../types/whatsapp';

const WHATSAPP_API_URL = 'https://graph.facebook.com';

class WhatsAppClient {
  private client: AxiosInstance;
  private phoneNumberId: string;

  constructor() {
    this.phoneNumberId = config.whatsapp.phoneNumberId;

    this.client = axios.create({
      baseURL: `${WHATSAPP_API_URL}/${config.whatsapp.apiVersion}/${this.phoneNumberId}`,
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('WhatsApp API error', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Send a text message
   */
  async sendText(to: string, text: string): Promise<void> {
    await this.client.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    });

    logger.debug('Text message sent', {
      to: `${to.slice(0, 4)}****`,
      textLength: text.length,
    });
  }

  /**
   * Send an interactive message (buttons or list)
   */
  async sendInteractive(to: string, interactive: WhatsAppInteractiveMessage): Promise<void> {
    await this.client.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    });

    logger.debug('Interactive message sent', {
      to: `${to.slice(0, 4)}****`,
      type: interactive.type,
    });
  }

  /**
   * Send interactive buttons
   */
  async sendButtons(
    to: string,
    body: string,
    buttons: Array<{ id: string; title: string }>,
    header?: string,
    footer?: string
  ): Promise<void> {
    const interactive: WhatsAppInteractiveMessage = {
      type: 'button',
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply' as const,
          reply: { id: b.id, title: b.title },
        })),
      },
    };

    if (header) {
      interactive.header = { type: 'text', text: header };
    }

    if (footer) {
      interactive.footer = { text: footer };
    }

    await this.sendInteractive(to, interactive);
  }

  /**
   * Send interactive list
   */
  async sendList(
    to: string,
    body: string,
    buttonText: string,
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    header?: string,
    footer?: string
  ): Promise<void> {
    const interactive: WhatsAppInteractiveMessage = {
      type: 'list',
      body: { text: body },
      action: {
        button: buttonText,
        sections,
      },
    };

    if (header) {
      interactive.header = { type: 'text', text: header };
    }

    if (footer) {
      interactive.footer = { text: footer };
    }

    await this.sendInteractive(to, interactive);
  }

  /**
   * Send an image
   */
  async sendImage(to: string, url: string, caption?: string): Promise<void> {
    await this.client.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'image',
      image: {
        link: url,
        caption,
      },
    });

    logger.debug('Image sent', {
      to: `${to.slice(0, 4)}****`,
      hasCaption: !!caption,
    });
  }

  /**
   * Send a document
   */
  async sendDocument(to: string, url: string, filename: string, caption?: string): Promise<void> {
    await this.client.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'document',
      document: {
        link: url,
        filename,
        caption,
      },
    });

    logger.debug('Document sent', {
      to: `${to.slice(0, 4)}****`,
      filename,
    });
  }

  /**
   * Send a template message (for notifications outside 24h window)
   */
  async sendTemplate(to: string, template: WhatsAppTemplateMessage): Promise<void> {
    await this.client.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template,
    });

    logger.debug('Template message sent', {
      to: `${to.slice(0, 4)}****`,
      templateName: template.name,
    });
  }

  /**
   * Send vaccination reminder
   */
  async sendVaccinationReminder(
    to: string,
    petName: string,
    vaccineName: string,
    dueDate: string
  ): Promise<void> {
    await this.sendTemplate(to, {
      name: 'vaccination_reminder',
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: petName },
            { type: 'text', text: vaccineName },
            { type: 'text', text: dueDate },
          ],
        },
      ],
    });
  }

  /**
   * Send medication reminder
   */
  async sendMedicationReminder(
    to: string,
    petName: string,
    medicationName: string,
    dosage: string
  ): Promise<void> {
    await this.sendTemplate(to, {
      name: 'medication_reminder',
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: petName },
            { type: 'text', text: medicationName },
            { type: 'text', text: dosage },
          ],
        },
      ],
    });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(
    to: string,
    userName: string,
    amount: string,
    dueDate: string
  ): Promise<void> {
    await this.sendTemplate(to, {
      name: 'payment_reminder',
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: userName },
            { type: 'text', text: amount },
            { type: 'text', text: dueDate },
          ],
        },
      ],
    });
  }

  /**
   * Download media from WhatsApp CDN
   */
  async downloadMedia(mediaId: string): Promise<Buffer> {
    // First, get the media URL
    const mediaResponse = await this.client.get(`/${mediaId}`, {
      baseURL: `${WHATSAPP_API_URL}/${config.whatsapp.apiVersion}`,
    });

    const mediaUrl = mediaResponse.data.url;

    // Download the actual file
    const fileResponse = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
      },
      responseType: 'arraybuffer',
    });

    logger.debug('Media downloaded', {
      mediaId,
      size: fileResponse.data.length,
    });

    return Buffer.from(fileResponse.data);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.client.post('/messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });

    logger.debug('Message marked as read', { messageId });
  }
}

export const whatsappClient = new WhatsAppClient();
