import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { Pet } from './entities/pet.entity';
import { User } from '../users/entities/user.entity';
import { HealthRecord } from '../health-records/entities/health-record.entity';
import { AppError } from '../../shared/middleware/error.middleware';
import { logger } from '../../shared/logger';

const router = Router();
const petRepository = () => AppDataSource.getRepository(Pet);
const userRepository = () => AppDataSource.getRepository(User);
const healthRecordRepository = () => AppDataSource.getRepository(HealthRecord);

// Get pet by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pet = await petRepository().findOne({
      where: { id },
    });

    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    res.json(pet);
  } catch (error) {
    next(error);
  }
});

// Create pet for user
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, name, species, breed, birthDate, sex, weight, neutered, photoUrl } = req.body;

    if (!userId || !name || !species) {
      throw new AppError(400, 'userId, name, and species are required');
    }

    // Verify user exists
    const user = await userRepository().findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const pet = petRepository().create({
      userId,
      name,
      species,
      breed,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      sex,
      weight,
      neutered: neutered || false,
      photoUrl,
    });

    await petRepository().save(pet);

    logger.info('Pet created', { petId: pet.id, userId });

    res.status(201).json(pet);
  } catch (error) {
    next(error);
  }
});

// Update pet
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, breed, birthDate, sex, weight, neutered, photoUrl } = req.body;

    const pet = await petRepository().findOne({ where: { id } });

    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    if (name) pet.name = name;
    if (breed) pet.breed = breed;
    if (birthDate) pet.birthDate = new Date(birthDate);
    if (sex) pet.sex = sex;
    if (weight !== undefined) pet.weight = weight;
    if (neutered !== undefined) pet.neutered = neutered;
    if (photoUrl) pet.photoUrl = photoUrl;

    await petRepository().save(pet);

    res.json(pet);
  } catch (error) {
    next(error);
  }
});

// Delete pet
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pet = await petRepository().findOne({ where: { id } });

    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    await petRepository().remove(pet);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get pet health records
router.get('/:id/records', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const records = await healthRecordRepository().find({
      where: { petId: id },
      order: { date: 'DESC' },
    });

    res.json(records);
  } catch (error) {
    next(error);
  }
});

// Create health record for pet
router.post('/:id/records', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { recordType, title, description, date, attachments, metadata, consultationId } = req.body;

    if (!recordType || !title || !date) {
      throw new AppError(400, 'recordType, title, and date are required');
    }

    // Verify pet exists
    const pet = await petRepository().findOne({ where: { id } });
    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    const record = healthRecordRepository().create({
      petId: id,
      consultationId,
      recordType,
      title,
      description,
      date: new Date(date),
      attachments,
      metadata,
    });

    await healthRecordRepository().save(record);

    logger.info('Health record created', { recordId: record.id, petId: id });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

export default router;
