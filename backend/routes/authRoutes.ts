import { Router } from 'express';
import { login, register, getMe, changePassword } from '../controllers/authController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.post('/login', login);
router.post('/register', authenticateToken, authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), register);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, changePassword);

export default router;
