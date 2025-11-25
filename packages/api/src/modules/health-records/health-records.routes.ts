import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { HealthRecord } from './entities/health-record.entity';
import { AppError } from '../../shared/middleware/error.middleware';

const router = Router();
const healthRecordRepository = () => AppDataSource.getRepository(HealthRecord);

// Get health record by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const record = await healthRecordRepository().findOne({
      where: { id },
      relations: ['pet', 'consultation'],
    });

    if (!record) {
      throw new AppError(404, 'Health record not found');
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
});

// Update health record
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, date, attachments, metadata } = req.body;

    const record = await healthRecordRepository().findOne({ where: { id } });

    if (!record) {
      throw new AppError(404, 'Health record not found');
    }

    if (title) record.title = title;
    if (description) record.description = description;
    if (date) record.date = new Date(date);
    if (attachments) record.attachments = attachments;
    if (metadata) record.metadata = metadata;

    await healthRecordRepository().save(record);

    res.json(record);
  } catch (error) {
    next(error);
  }
});

// Delete health record
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const record = await healthRecordRepository().findOne({ where: { id } });

    if (!record) {
      throw new AppError(404, 'Health record not found');
    }

    await healthRecordRepository().remove(record);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
