// Jest test setup file for whatsapp-handler

// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.WHATSAPP_VERIFY_TOKEN = 'test-verify-token';
process.env.WHATSAPP_ACCESS_TOKEN = 'test-access-token';
process.env.WHATSAPP_PHONE_NUMBER_ID = 'test-phone-id';
process.env.WHATSAPP_APP_SECRET = 'test-app-secret';
process.env.API_URL = 'http://localhost:3000';
process.env.AI_SERVICES_URL = 'http://localhost:8000';

// Global test timeout
jest.setTimeout(10000);

// Mock Bull queue
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    isReady: jest.fn().mockResolvedValue(true),
    getJobCounts: jest.fn().mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }));
});

// Cleanup after all tests
afterAll(async () => {
  // Allow pending promises to resolve
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// Basic test to ensure setup runs correctly
describe('Test Setup', () => {
  it('should initialize test environment correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.WHATSAPP_VERIFY_TOKEN).toBe('test-verify-token');
  });

  it('should set up test configuration', () => {
    expect(process.env.PORT).toBe('8000');
    expect(process.env.API_BASE_URL).toBeTruthy();
  });
});
