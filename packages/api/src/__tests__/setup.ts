// Jest test setup file for API

// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/petvet_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:5173';

// Global test timeout
jest.setTimeout(10000);

// Mock TypeORM DataSource
jest.mock('../config/database', () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
      create: jest.fn().mockImplementation((entity) => entity),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    }),
  },
}));

// Cleanup after all tests
afterAll(async () => {
  // Allow pending promises to resolve
  await new Promise((resolve) => setTimeout(resolve, 100));
});
