import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getDepartments);
router.post('/', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), createDepartment);
router.put('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), updateDepartment);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin'), deleteDepartment);

export default router;
