import { Router } from 'express';
import {
  getLeakRecords,
  getLeakRecordById,
  createLeakRecord,
  updateLeakRecord,
  deleteLeakRecord,
} from '../controllers/leakController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeakRecords);
router.get('/:id', getLeakRecordById);
// Any hospital staff can report a leak for safety, but modifications/closing require facility mgr/admin
router.post('/', createLeakRecord);
router.put('/:id', authorizeRoles('SuperAdmin', 'Admin', 'Facility Manager'), updateLeakRecord);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin', 'Facility Manager'), deleteLeakRecord);

export default router;
