import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), createEmployee);
router.put('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), updateEmployee);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin'), deleteEmployee);

export default router;
