import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/middleware/error.middleware';
import { logger } from '../../shared/logger';

const router = Router();

// Subscription plans
const PLANS = {
  basic: {
    name: 'Basico',
    price: 29.90,
    consultations: 5,
    pets: 1,
    features: ['5 consultas/mes', '1 pet'],
  },
  family: {
    name: 'Familia',
    price: 49.90,
    consultations: -1, // unlimited
    pets: 3,
    features: ['Consultas ilimitadas', 'Ate 3 pets'],
  },
  premium: {
    name: 'Premium',
    price: 79.90,
    consultations: -1, // unlimited
    pets: -1, // unlimited
    features: ['Consultas ilimitadas', 'Pets ilimitados', 'Analise de imagem', 'Suporte prioritario'],
  },
};

// Get available plans
router.get('/plans', async (_req: Request, res: Response) => {
  res.json(PLANS);
});

// Create subscription
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
      throw new AppError(400, 'userId and plan are required');
    }

    if (!PLANS[plan as keyof typeof PLANS]) {
      throw new AppError(400, 'Invalid plan');
    }

    // TODO: Integrate with Stripe
    // For now, return mock subscription
    const subscription = {
      id: `sub_${Date.now()}`,
      userId,
      plan,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    logger.info('Subscription created', { subscriptionId: subscription.id, userId, plan });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
});

// Get current subscription
router.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // TODO: Fetch from database
    throw new AppError(404, 'No subscription found');
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.delete('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    // TODO: Cancel in Stripe
    logger.info('Subscription cancelled', { userId });

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
});

export default router;
