import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../config/database';
import { Consultation } from './entities/consultation.entity';
import { Pet } from '../pets/entities/pet.entity';
import { HealthRecord } from '../health-records/entities/health-record.entity';
import { AppError } from '../../shared/middleware/error.middleware';
import { logger } from '../../shared/logger';

const router = Router();
const consultationRepository = () => AppDataSource.getRepository(Consultation);
const petRepository = () => AppDataSource.getRepository(Pet);
const healthRecordRepository = () => AppDataSource.getRepository(HealthRecord);

// Create consultation
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { petId, symptoms, whatsappConversationId } = req.body;

    if (!petId || !symptoms) {
      throw new AppError(400, 'petId and symptoms are required');
    }

    // Verify pet exists
    const pet = await petRepository().findOne({ where: { id: petId } });
    if (!pet) {
      throw new AppError(404, 'Pet not found');
    }

    const consultation = consultationRepository().create({
      petId,
      symptoms,
      whatsappConversationId,
      status: 'active',
    });

    await consultationRepository().save(consultation);

    logger.info('Consultation started', { consultationId: consultation.id, petId });

    res.status(201).json(consultation);
  } catch (error) {
    next(error);
  }
});

// Get consultation by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const consultation = await consultationRepository().findOne({
      where: { id },
      relations: ['pet'],
    });

    if (!consultation) {
      throw new AppError(404, 'Consultation not found');
    }

    res.json(consultation);
  } catch (error) {
    next(error);
  }
});

// Update consultation
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, diagnosis, treatment, urgencyLevel, prescriptionUrl } = req.body;

    const consultation = await consultationRepository().findOne({ where: { id } });

    if (!consultation) {
      throw new AppError(404, 'Consultation not found');
    }

    if (status) consultation.status = status;
    if (diagnosis) consultation.diagnosis = diagnosis;
    if (treatment) consultation.treatment = treatment;
    if (urgencyLevel) consultation.urgencyLevel = urgencyLevel;
    if (prescriptionUrl) consultation.prescriptionUrl = prescriptionUrl;

    if (status === 'completed' && !consultation.completedAt) {
      consultation.completedAt = new Date();

      // Create health record
      const pet = await petRepository().findOne({ where: { id: consultation.petId } });
      if (pet) {
        const record = healthRecordRepository().create({
          petId: consultation.petId,
          consultationId: consultation.id,
          recordType: 'consultation',
          title: `Consulta: ${diagnosis?.primary || 'Avaliacao'}`,
          description: consultation.symptoms,
          date: new Date(),
          metadata: {
            diagnosis,
            treatment,
            urgencyLevel,
          },
        });

        await healthRecordRepository().save(record);
        logger.info('Health record created from consultation', {
          recordId: record.id,
          consultationId: consultation.id,
        });
      }
    }

    await consultationRepository().save(consultation);

    logger.info('Consultation updated', { consultationId: id, status });

    res.json(consultation);
  } catch (error) {
    next(error);
  }
});

// Generate prescription
router.post('/:id/prescription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const consultation = await consultationRepository().findOne({
      where: { id },
      relations: ['pet', 'pet.user'],
    });

    if (!consultation) {
      throw new AppError(404, 'Consultation not found');
    }

    if (!consultation.diagnosis || !consultation.treatment) {
      throw new AppError(400, 'Consultation must have diagnosis and treatment');
    }

    // TODO: Generate PDF and upload to S3
    // For now, return a placeholder URL
    const prescriptionUrl = `https://petvet-prescriptions.s3.amazonaws.com/${id}/prescription.pdf`;

    consultation.prescriptionUrl = prescriptionUrl;
    await consultationRepository().save(consultation);

    logger.info('Prescription generated', { consultationId: id });

    res.json({ url: prescriptionUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
