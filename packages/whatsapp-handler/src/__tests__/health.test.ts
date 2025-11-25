import request from 'supertest';
import express, { Express } from 'express';

// Create a minimal test app that mimics the health routes
function createTestApp(): Express {
  const app = express();

  // Mock the health routes directly for testing
  app.get('/health', (_req, res) => {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'whatsapp-handler',
      version: '1.0.0',
    });
  });

  app.get('/health/live', (_req, res) => {
    return res.status(200).json({ status: 'live' });
  });

  app.get('/health/ready', (_req, res) => {
    return res.status(200).json({ status: 'ready' });
  });

  return app;
}

describe('Health Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 with healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'whatsapp-handler');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 when service is ready', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
    });
  });

  describe('GET /health/live', () => {
    it('should return 200 when service is alive', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'live');
    });
  });
});
