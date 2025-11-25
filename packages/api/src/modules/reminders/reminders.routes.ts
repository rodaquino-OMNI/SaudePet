import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/middleware/error.middleware';
import { logger } from '../../shared/logger';

const router = Router();

// Reminder types
const REMINDER_TYPES = ['vaccine', 'medication', 'checkup', 'appointment', 'other'] as const;
type ReminderType = typeof REMINDER_TYPES[number];

interface Reminder {
  id: string;
  petId: string;
  reminderType: ReminderType;
  title: string;
  description?: string;
  scheduledDate: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'snoozed';
  sentAt?: string;
  createdAt: string;
}

// In-memory storage for development
// TODO: Replace with database queries using TypeORM
const reminders: Map<string, Reminder> = new Map();

// Get reminders for a pet
router.get('/pet/:petId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { petId } = req.params;
    const { status, type } = req.query;

    const petReminders = Array.from(reminders.values())
      .filter((r) => r.petId === petId)
      .filter((r) => !status || r.status === status)
      .filter((r) => !type || r.reminderType === type)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    res.json(petReminders);
  } catch (error) {
    next(error);
  }
});

// Get all reminders for a user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { status, upcoming } = req.query;

    if (!userId) {
      throw new AppError(401, 'Not authenticated');
    }

    let userReminders = Array.from(reminders.values());

    // Filter by status
    if (status) {
      userReminders = userReminders.filter((r) => r.status === status);
    }

    // Filter upcoming (next 7 days)
    if (upcoming === 'true') {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      userReminders = userReminders.filter((r) => {
        const date = new Date(r.scheduledDate);
        return date >= now && date <= nextWeek;
      });
    }

    // Sort by scheduled date
    userReminders.sort((a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );

    res.json(userReminders);
  } catch (error) {
    next(error);
  }
});

// Create a reminder
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { petId, reminderType, title, description, scheduledDate } = req.body;

    if (!petId || !reminderType || !title || !scheduledDate) {
      throw new AppError(400, 'petId, reminderType, title, and scheduledDate are required');
    }

    if (!REMINDER_TYPES.includes(reminderType)) {
      throw new AppError(400, `Invalid reminderType. Must be one of: ${REMINDER_TYPES.join(', ')}`);
    }

    const scheduled = new Date(scheduledDate);
    if (isNaN(scheduled.getTime())) {
      throw new AppError(400, 'Invalid scheduledDate format');
    }

    const reminder: Reminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      petId,
      reminderType,
      title,
      description,
      scheduledDate: scheduled.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    reminders.set(reminder.id, reminder);

    logger.info('Reminder created', { reminderId: reminder.id, petId, type: reminderType });

    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
});

// Get a specific reminder
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reminder = reminders.get(id);

    if (!reminder) {
      throw new AppError(404, 'Reminder not found');
    }

    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

// Update a reminder
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledDate, status } = req.body;

    const reminder = reminders.get(id);
    if (!reminder) {
      throw new AppError(404, 'Reminder not found');
    }

    if (title) reminder.title = title;
    if (description !== undefined) reminder.description = description;
    if (scheduledDate) {
      const scheduled = new Date(scheduledDate);
      if (isNaN(scheduled.getTime())) {
        throw new AppError(400, 'Invalid scheduledDate format');
      }
      reminder.scheduledDate = scheduled.toISOString();
    }
    if (status && ['pending', 'sent', 'acknowledged', 'snoozed'].includes(status)) {
      reminder.status = status;
    }

    reminders.set(id, reminder);

    logger.info('Reminder updated', { reminderId: id });

    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

// Mark reminder as acknowledged
router.post('/:id/acknowledge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reminder = reminders.get(id);

    if (!reminder) {
      throw new AppError(404, 'Reminder not found');
    }

    reminder.status = 'acknowledged';
    reminders.set(id, reminder);

    logger.info('Reminder acknowledged', { reminderId: id });

    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

// Snooze a reminder
router.post('/:id/snooze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { duration = 24 } = req.body; // Duration in hours, default 24

    const reminder = reminders.get(id);
    if (!reminder) {
      throw new AppError(404, 'Reminder not found');
    }

    const newScheduledDate = new Date(
      new Date(reminder.scheduledDate).getTime() + duration * 60 * 60 * 1000
    );

    reminder.scheduledDate = newScheduledDate.toISOString();
    reminder.status = 'snoozed';
    reminders.set(id, reminder);

    logger.info('Reminder snoozed', { reminderId: id, newDate: reminder.scheduledDate });

    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

// Delete a reminder
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!reminders.has(id)) {
      throw new AppError(404, 'Reminder not found');
    }

    reminders.delete(id);

    logger.info('Reminder deleted', { reminderId: id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get pending reminders for processing (internal endpoint)
router.get('/internal/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const pendingReminders = Array.from(reminders.values())
      .filter((r) => r.status === 'pending')
      .filter((r) => new Date(r.scheduledDate) <= now);

    res.json(pendingReminders);
  } catch (error) {
    next(error);
  }
});

// Mark reminder as sent (internal endpoint)
router.post('/internal/:id/sent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const reminder = reminders.get(id);

    if (!reminder) {
      throw new AppError(404, 'Reminder not found');
    }

    reminder.status = 'sent';
    reminder.sentAt = new Date().toISOString();
    reminders.set(id, reminder);

    logger.info('Reminder marked as sent', { reminderId: id });

    res.json(reminder);
  } catch (error) {
    next(error);
  }
});

export default router;
