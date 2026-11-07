import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), getUsers);
router.get('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), getUserById);
router.put('/:id', authorizeRoles('SuperAdmin', 'Admin'), updateUser);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin'), deleteUser);

export default router;
