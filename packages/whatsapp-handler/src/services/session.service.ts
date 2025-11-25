import Redis from 'ioredis';
import { v4 as uuid } from 'uuid';
import { config } from '../config';
import { apiClient } from '../clients/api.client';
import { logger } from '../utils/logger';

const SESSION_PREFIX = 'whatsapp:session:';
const SESSION_TTL = config.session.ttlSeconds;

export interface Session {
  id: string;
  phoneNumber: string;
  userId?: string;
  contactName?: string;
  state: SessionState;
  activePetId?: string;
  createdAt: string;
  lastActivityAt: string;
}

export interface SessionState {
  currentFlow: string;
  currentStep: string | null;
  [key: string]: unknown;
}

interface CreateSessionOptions {
  contactName?: string;
  phoneNumberId?: string;
}

class SessionService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    this.redis.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  /**
   * Get existing session or create a new one
   */
  async getOrCreate(phoneNumber: string, options?: CreateSessionOptions): Promise<Session> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;

    // Try to get existing session
    const existing = await this.redis.get(key);
    if (existing) {
      const session = JSON.parse(existing) as Session;

      // Update last activity and extend TTL
      session.lastActivityAt = new Date().toISOString();
      await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));

      logger.debug('Session retrieved', {
        sessionId: session.id,
        phoneNumber: `${phoneNumber.slice(0, 4)}****`,
      });

      return session;
    }

    // Create new session
    const session: Session = {
      id: uuid(),
      phoneNumber,
      contactName: options?.contactName,
      state: {
        currentFlow: 'main-menu',
        currentStep: null,
      },
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    // Try to find existing user by phone number
    try {
      const user = await apiClient.getUserByPhone(phoneNumber);
      if (user) {
        session.userId = user.id;

        // Get user's pets
        const pets = await apiClient.getPets(user.id);
        if (pets.length === 1) {
          session.activePetId = pets[0].id;
        }

        logger.debug('Found existing user for session', {
          sessionId: session.id,
          userId: user.id,
          petsCount: pets.length,
        });
      }
    } catch (error) {
      // User not found - will be created during onboarding
      logger.debug('No existing user found for phone number', {
        sessionId: session.id,
      });
    }

    await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));

    logger.info('New session created', {
      sessionId: session.id,
      phoneNumber: `${phoneNumber.slice(0, 4)}****`,
      hasUser: !!session.userId,
    });

    return session;
  }

  /**
   * Update session state
   */
  async update(sessionId: string, newState: Partial<SessionState>): Promise<void> {
    // Find session by ID (scan keys)
    const keys = await this.redis.keys(`${SESSION_PREFIX}*`);

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const session = JSON.parse(data) as Session;
        if (session.id === sessionId) {
          session.state = { ...session.state, ...newState };
          session.lastActivityAt = new Date().toISOString();
          await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));

          logger.debug('Session updated', {
            sessionId,
            newFlow: newState.currentFlow,
            newStep: newState.currentStep,
          });
          return;
        }
      }
    }

    logger.warn('Session not found for update', { sessionId });
  }

  /**
   * Update session by phone number
   */
  async updateByPhone(phoneNumber: string, updates: Partial<Session>): Promise<void> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    const data = await this.redis.get(key);

    if (data) {
      const session = JSON.parse(data) as Session;
      Object.assign(session, updates);
      session.lastActivityAt = new Date().toISOString();
      await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));

      logger.debug('Session updated by phone', {
        sessionId: session.id,
      });
    }
  }

  /**
   * Set user ID for session
   */
  async setUserId(phoneNumber: string, userId: string): Promise<void> {
    await this.updateByPhone(phoneNumber, { userId });
  }

  /**
   * Set active pet for session
   */
  async setActivePet(phoneNumber: string, petId: string): Promise<void> {
    await this.updateByPhone(phoneNumber, { activePetId: petId });
  }

  /**
   * Clear session
   */
  async clear(phoneNumber: string): Promise<void> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    await this.redis.del(key);

    logger.info('Session cleared', {
      phoneNumber: `${phoneNumber.slice(0, 4)}****`,
    });
  }

  /**
   * Get session by phone number
   */
  async get(phoneNumber: string): Promise<Session | null> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    const data = await this.redis.get(key);

    if (data) {
      return JSON.parse(data) as Session;
    }

    return null;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export const sessionService = new SessionService();
