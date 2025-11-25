import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { AppError } from '../../shared/middleware/error.middleware';
import { logger } from '../../shared/logger';
import { config } from '../../config';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(config.stripe?.secretKey || '', {
  apiVersion: '2023-10-16',
});

// Subscription plans with Stripe Price IDs
const PLANS = {
  basic: {
    name: 'Basico',
    price: 29.90,
    consultations: 5,
    pets: 1,
    features: ['5 consultas/mes', '1 pet'],
    stripePriceId: process.env.STRIPE_PRICE_BASIC || 'price_basic',
  },
  family: {
    name: 'Familia',
    price: 49.90,
    consultations: -1, // unlimited
    pets: 3,
    features: ['Consultas ilimitadas', 'Ate 3 pets'],
    stripePriceId: process.env.STRIPE_PRICE_FAMILY || 'price_family',
  },
  premium: {
    name: 'Premium',
    price: 79.90,
    consultations: -1, // unlimited
    pets: -1, // unlimited
    features: ['Consultas ilimitadas', 'Pets ilimitados', 'Analise de imagem', 'Suporte prioritario'],
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium',
  },
};

// Get available plans
router.get('/plans', async (_req: Request, res: Response) => {
  // Return plans without Stripe Price IDs (internal use only)
  const publicPlans = Object.entries(PLANS).reduce((acc, [key, plan]) => {
    const { stripePriceId, ...publicPlan } = plan;
    return { ...acc, [key]: publicPlan };
  }, {});

  res.json(publicPlans);
});

// Create subscription (or checkout session for payment)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, plan, successUrl, cancelUrl } = req.body;

    if (!userId || !plan) {
      throw new AppError(400, 'userId and plan are required');
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    if (!selectedPlan) {
      throw new AppError(400, 'Invalid plan');
    }

    // If Stripe is not configured, return mock subscription
    if (!config.stripe?.secretKey) {
      logger.warn('Stripe not configured, returning mock subscription');
      const subscription = {
        id: `sub_mock_${Date.now()}`,
        userId,
        plan,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      logger.info('Mock subscription created', { subscriptionId: subscription.id, userId, plan });
      return res.status(201).json(subscription);
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId: string;

    // In a real app, we would look up the user in the database
    // For now, create a new customer
    const customer = await stripe.customers.create({
      metadata: { userId },
    });
    stripeCustomerId = customer.id;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${config.appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${config.appUrl}/subscription/cancel`,
      metadata: {
        userId,
        plan,
      },
    });

    logger.info('Stripe checkout session created', {
      sessionId: session.id,
      userId,
      plan
    });

    res.status(201).json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
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

    // In a real app, fetch subscription from database
    // For now, return mock data
    // TODO: Implement database lookup

    // Mock response for development
    const mockSubscription = {
      id: 'sub_mock_123',
      userId,
      plan: 'basic',
      status: 'active',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    };

    res.json(mockSubscription);
  } catch (error) {
    next(error);
  }
});

// Update subscription (upgrade/downgrade)
router.put('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { plan } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      throw new AppError(400, 'Invalid plan');
    }

    // If Stripe is not configured, return mock response
    if (!config.stripe?.secretKey) {
      logger.warn('Stripe not configured, returning mock update');
      return res.json({
        message: 'Subscription updated',
        plan,
        status: 'active',
      });
    }

    // In a real app:
    // 1. Look up user's Stripe subscription ID from database
    // 2. Update the subscription with new price
    // For now, return mock response

    logger.info('Subscription update requested', { userId, plan });

    res.json({
      message: 'Subscription updated',
      plan,
      status: 'active',
    });
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

    // If Stripe is configured, cancel in Stripe
    if (config.stripe?.secretKey) {
      // In a real app:
      // 1. Look up user's Stripe subscription ID from database
      // 2. Cancel the subscription via Stripe API
      // await stripe.subscriptions.cancel(subscriptionId);
      logger.info('Stripe subscription cancelled', { userId });
    }

    logger.info('Subscription cancelled', { userId });

    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string;

    if (!config.stripe?.webhookSecret) {
      logger.warn('Stripe webhook secret not configured');
      return res.sendStatus(200);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err: any) {
      logger.error('Webhook signature verification failed', { error: err.message });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info('Checkout session completed', {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        // TODO: Create subscription record in database
        // const { userId, plan } = session.metadata;
        // await createSubscriptionRecord(userId, plan, session.subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Subscription updated', {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        // TODO: Update subscription status in database
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logger.info('Subscription deleted', {
          subscriptionId: subscription.id,
        });

        // TODO: Update subscription status to cancelled in database
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logger.warn('Payment failed', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        });

        // TODO: Send WhatsApp notification about payment failure
        break;
      }

      default:
        logger.debug('Unhandled event type', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
