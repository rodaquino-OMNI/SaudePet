import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { User } from './entities/user.entity';
import { AppError } from '../../shared/middleware/error.middleware';
import { logger } from '../../shared/logger';

const router = Router();
const userRepository = () => AppDataSource.getRepository(User);

// Get user by phone number
router.get('/by-phone/:phoneNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber } = req.params;

    const user = await userRepository().findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, name, email } = req.body;

    if (!phoneNumber) {
      throw new AppError(400, 'Phone number is required');
    }

    // Check if user exists
    const existing = await userRepository().findOne({ where: { phoneNumber } });
    if (existing) {
      throw new AppError(409, 'User already exists');
    }

    const user = userRepository().create({
      phoneNumber,
      name,
      email,
    });

    await userRepository().save(user);

    logger.info('User created', { userId: user.id });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await userRepository().findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { name, email } = req.body;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await userRepository().findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await userRepository().save(user);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user's pets
router.get('/:userId/pets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await userRepository().findOne({
      where: { id: userId },
      relations: ['pets'],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user.pets);
  } catch (error) {
    next(error);
  }
});

// Get user's subscription
router.get('/:userId/subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // TODO: Implement subscription lookup
    res.status(404).json({ error: 'No subscription found' });
  } catch (error) {
    next(error);
  }
});

export default router;
