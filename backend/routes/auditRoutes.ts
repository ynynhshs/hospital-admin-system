import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);
router.get('/', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), getAuditLogs);

export default router;
