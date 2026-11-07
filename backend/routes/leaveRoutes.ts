import { Router } from 'express';
import { getLeaves, applyLeave, reviewLeave, deleteLeave } from '../controllers/leaveController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeaves);
router.post('/apply', applyLeave);
router.put('/:id/review', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), reviewLeave);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), deleteLeave);

export default router;
