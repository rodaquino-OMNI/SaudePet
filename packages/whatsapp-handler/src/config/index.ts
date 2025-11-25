import { z } from 'zod';

const configSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.coerce.number().default(3001),

  // WhatsApp Configuration
  whatsapp: z.object({
    verifyToken: z.string(),
    accessToken: z.string(),
    phoneNumberId: z.string(),
    appSecret: z.string(),
    apiVersion: z.string().default('v18.0'),
  }),

  // Internal Services
  services: z.object({
    apiUrl: z.string().url(),
    aiServicesUrl: z.string().url(),
  }),

  // Redis Configuration
  redis: z.object({
    url: z.string().url(),
  }),

  // Session Configuration
  session: z.object({
    ttlSeconds: z.coerce.number().default(86400), // 24 hours
  }),

  // AWS Configuration (optional, for metrics)
  aws: z.object({
    region: z.string().default('us-east-1'),
    cloudwatchEnabled: z.boolean().default(false),
  }).optional(),

  // Environment flag
  env: z.string().default('development'),
});

type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse({
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    whatsapp: {
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      appSecret: process.env.WHATSAPP_APP_SECRET,
      apiVersion: process.env.WHATSAPP_API_VERSION,
    },
    services: {
      apiUrl: process.env.API_URL,
      aiServicesUrl: process.env.AI_SERVICES_URL,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    session: {
      ttlSeconds: process.env.SESSION_TTL_SECONDS,
    },
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      cloudwatchEnabled: process.env.CLOUDWATCH_ENABLED === 'true',
    },
    env: process.env.NODE_ENV || 'development',
  });

  if (!result.success) {
    console.error('Configuration validation failed:', result.error.format());

    // In development, use defaults for missing values
    if (process.env.NODE_ENV === 'development') {
      return {
        environment: 'development',
        port: 3001,
        whatsapp: {
          verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'dev-verify-token',
          accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'dev-access-token',
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'dev-phone-id',
          appSecret: process.env.WHATSAPP_APP_SECRET || 'dev-app-secret',
          apiVersion: 'v18.0',
        },
        services: {
          apiUrl: process.env.API_URL || 'http://localhost:3000',
          aiServicesUrl: process.env.AI_SERVICES_URL || 'http://localhost:8000',
        },
        redis: {
          url: process.env.REDIS_URL || 'redis://localhost:6379',
        },
        session: {
          ttlSeconds: 86400,
        },
        aws: {
          region: 'us-east-1',
          cloudwatchEnabled: false,
        },
        env: 'development',
      };
    }

    throw new Error('Invalid configuration');
  }

  return result.data;
}

export const config = loadConfig();
