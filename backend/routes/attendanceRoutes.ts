import { Router } from 'express';
import {
  getAttendance,
  recordAttendance,
  clockIn,
  clockOut,
  deleteAttendance,
} from '../controllers/attendanceController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/record', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), recordAttendance);
router.delete('/:id', authorizeRoles('SuperAdmin', 'Admin', 'HR Manager'), deleteAttendance);

export default router;
