import { Router } from 'express';
import { getDashboardStats, getSystemStatus, resetOrSeedDB } from '../controllers/dashboardController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);
router.get('/metrics', getDashboardStats);
router.get('/system-status', getSystemStatus);
router.post('/seed', authorizeRoles('SuperAdmin', 'Admin'), resetOrSeedDB);

export default router;
