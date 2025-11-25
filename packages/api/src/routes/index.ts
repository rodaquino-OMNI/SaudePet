import { Router } from 'express';
import usersRoutes from '../modules/users/users.routes';
import petsRoutes from '../modules/pets/pets.routes';
import consultationsRoutes from '../modules/consultations/consultations.routes';
import healthRecordsRoutes from '../modules/health-records/health-records.routes';
import subscriptionsRoutes from '../modules/subscriptions/subscriptions.routes';

const router = Router();

router.use('/users', usersRoutes);
router.use('/pets', petsRoutes);
router.use('/consultations', consultationsRoutes);
router.use('/health-records', healthRecordsRoutes);
router.use('/subscriptions', subscriptionsRoutes);

export default router;
