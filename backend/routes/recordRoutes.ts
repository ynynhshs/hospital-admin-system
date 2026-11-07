import { Router } from 'express';
import {
  getEmployeeRecords,
  createEmployeeRecord,
  updateEmployeeRecord,
  deleteEmployeeRecord,
} from '../controllers/recordController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmployeeRecords);
router.post('/', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), createEmployeeRecord);
router.put('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), updateEmployeeRecord);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), deleteEmployeeRecord);

export default router;
