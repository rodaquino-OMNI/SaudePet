import { z } from 'zod';

const configSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.coerce.number().default(3000),

  database: z.object({
    url: z.string(),
  }),

  redis: z.object({
    url: z.string(),
  }),

  jwt: z.object({
    secret: z.string(),
    expiresIn: z.string().default('7d'),
  }),

  stripe: z.object({
    secretKey: z.string(),
    webhookSecret: z.string().optional(),
  }),

  cors: z.object({
    origins: z.array(z.string()).default(['http://localhost:3000', 'http://localhost:5173']),
  }),

  aiServices: z.object({
    url: z.string(),
  }),
});

type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse({
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || undefined,
    },
    aiServices: {
      url: process.env.AI_SERVICES_URL,
    },
  });

  if (!result.success) {
    console.error('Configuration validation failed:', result.error.format());

    // In development, use defaults
    if (process.env.NODE_ENV === 'development') {
      return {
        environment: 'development',
        port: 3000,
        database: {
          url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/petvet',
        },
        redis: {
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        },
        jwt: {
          secret: process.env.JWT_SECRET || 'dev-secret-key',
          expiresIn: '7d',
        },
        stripe: {
          secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_xxx',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        },
        cors: {
          origins: ['http://localhost:3000', 'http://localhost:5173'],
        },
        aiServices: {
          url: process.env.AI_SERVICES_URL || 'http://localhost:8000',
        },
      };
    }

    throw new Error('Invalid configuration');
  }

  return result.data;
}

export const config = loadConfig();
