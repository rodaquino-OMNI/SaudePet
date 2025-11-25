import request from 'supertest';
import express, { Express, Request, Response } from 'express';
import crypto from 'crypto';

// Test configuration
const TEST_VERIFY_TOKEN = 'test-verify-token';
const TEST_APP_SECRET = 'test-app-secret';

function createWebhookTestApp(): Express {
  const app = express();

  // Parse JSON with raw body storage for signature verification
  app.use(express.json({
    verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
      req.rawBody = buf;
    },
  }));

  // GET endpoint for webhook verification
  app.get('/webhooks/whatsapp', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    if (!mode || !token || !challenge) {
      return res.sendStatus(400);
    }

    if (mode === 'subscribe' && token === TEST_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  });

  // POST endpoint for receiving messages
  app.post('/webhooks/whatsapp', (req: Request, res: Response) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

    // Validate signature if present
    if (signature && rawBody) {
      const expectedSignature = crypto
        .createHmac('sha256', TEST_APP_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signature !== `sha256=${expectedSignature}`) {
        return res.sendStatus(401);
      }
    }

    const payload = req.body;

    if (payload.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    // Return 200 immediately as per WhatsApp requirements
    return res.status(200).send('EVENT_RECEIVED');
  });

  return app;
}

function generateSignature(payload: object): string {
  const bodyString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', TEST_APP_SECRET)
    .update(bodyString)
    .digest('hex');
  return `sha256=${signature}`;
}

describe('WhatsApp Webhook Controller', () => {
  let app: Express;

  beforeAll(() => {
    app = createWebhookTestApp();
  });

  describe('GET /webhooks/whatsapp (Verification)', () => {
    it('should verify webhook with correct token', async () => {
      const challenge = 'test-challenge-123';

      const response = await request(app)
        .get('/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': TEST_VERIFY_TOKEN,
          'hub.challenge': challenge,
        })
        .expect(200);

      expect(response.text).toBe(challenge);
    });

    it('should reject webhook with incorrect token', async () => {
      await request(app)
        .get('/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': 'test-challenge',
        })
        .expect(403);
    });

    it('should reject webhook with missing parameters', async () => {
      await request(app)
        .get('/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
        })
        .expect(400);
    });
  });

  describe('POST /webhooks/whatsapp (Message Reception)', () => {
    it('should return 200 for valid message webhook with signature', async () => {
      const webhookPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'test-entry-id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+5511999999999',
                    phone_number_id: 'test-phone-id',
                  },
                  messages: [
                    {
                      from: '5511888888888',
                      id: 'test-message-id',
                      timestamp: '1234567890',
                      type: 'text',
                      text: {
                        body: 'Hello',
                      },
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const signature = generateSignature(webhookPayload);

      const response = await request(app)
        .post('/webhooks/whatsapp')
        .set('x-hub-signature-256', signature)
        .send(webhookPayload)
        .expect(200);

      expect(response.text).toBe('EVENT_RECEIVED');
    });

    it('should return 200 for status update webhook', async () => {
      const webhookPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'test-entry-id',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  statuses: [
                    {
                      id: 'test-message-id',
                      status: 'delivered',
                      timestamp: '1234567890',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const signature = generateSignature(webhookPayload);

      const response = await request(app)
        .post('/webhooks/whatsapp')
        .set('x-hub-signature-256', signature)
        .send(webhookPayload)
        .expect(200);

      expect(response.text).toBe('EVENT_RECEIVED');
    });

    it('should return 404 for non-whatsapp object', async () => {
      const webhookPayload = {
        object: 'other_platform',
        entry: [],
      };

      const signature = generateSignature(webhookPayload);

      await request(app)
        .post('/webhooks/whatsapp')
        .set('x-hub-signature-256', signature)
        .send(webhookPayload)
        .expect(404);
    });
  });
});
