import { Router } from 'express';
import usersRoutes from '../modules/users/users.routes';
import petsRoutes from '../modules/pets/pets.routes';
import consultationsRoutes from '../modules/consultations/consultations.routes';
import healthRecordsRoutes from '../modules/health-records/health-records.routes';
import subscriptionsRoutes from '../modules/subscriptions/subscriptions.routes';
import remindersRoutes from '../modules/reminders/reminders.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/pets', petsRoutes);
router.use('/consultations', consultationsRoutes);
router.use('/health-records', healthRecordsRoutes);
router.use('/subscriptions', subscriptionsRoutes);
router.use('/reminders', remindersRoutes);

export default router;
