import { Router } from 'express';
import { generateReport } from '../controllers/reportController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/generate', generateReport);

export default router;
