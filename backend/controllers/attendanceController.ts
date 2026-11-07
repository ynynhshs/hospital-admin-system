import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, department, status, employeeCode } = req.query;
    const records = await storage.getAttendance({
      date: date as string,
      department: department as string,
      status: status as string,
      employeeCode: employeeCode as string,
    });

    return res.status(200).json({ success: true, count: records.length, attendance: records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve attendance logs.' });
  }
};

export const recordAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeCode, date, timeIn, timeOut, status, workHours, overtimeHours, shift, remarks } = req.body;

    if (!employeeCode || !date) {
      return res.status(400).json({ success: false, message: 'Employee code and date are required.' });
    }

    const employee = await storage.getEmployeeById(employeeCode);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const record = await storage.createOrUpdateAttendance({
      employeeId: employee._id.toString(),
      employeeCode: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      date,
      timeIn: timeIn || '',
      timeOut: timeOut || '',
      status: status || 'Present',
      workHours: workHours !== undefined ? Number(workHours) : 8,
      overtimeHours: overtimeHours !== undefined ? Number(overtimeHours) : 0,
      shift: shift || employee.shift || 'Morning (07:00 - 15:00)',
      remarks: remarks || '',
      markedBy: req.user?.fullName || 'Supervisor Override',
    });

    await logUserAction(
      req,
      'UPDATE',
      'Attendance',
      `Recorded attendance for ${record.employeeName} on ${record.date} [${record.status}]`
    );

    return res.status(200).json({ success: true, message: 'Attendance recorded successfully.', record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
};

export const clockIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeCode } = req.body;
    const targetCode = employeeCode || 'EMP-1001';

    const emp = await storage.getEmployeeById(targetCode);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeInStr = formatTime(now);

    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);

    const record = await storage.createOrUpdateAttendance({
      employeeId: emp._id.toString(),
      employeeCode: emp.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      date: today,
      timeIn: timeInStr,
      status: isLate ? 'Late' : 'Present',
      shift: emp.shift || 'Morning (07:00 - 15:00)',
      markedBy: `${req.user?.fullName || 'User'} (Self Clock-In)`,
    });

    await logUserAction(req, 'CREATE', 'Attendance', `Employee ${emp.firstName} ${emp.lastName} clocked in at ${timeInStr}`);

    return res.status(200).json({ success: true, message: `Clock-in successful at ${timeInStr}`, record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Clock-in failed.' });
  }
};

export const clockOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeCode } = req.body;
    const targetCode = employeeCode || 'EMP-1001';

    const emp = await storage.getEmployeeById(targetCode);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeOutStr = formatTime(now);

    const record = await storage.createOrUpdateAttendance({
      employeeId: emp._id.toString(),
      employeeCode: emp.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      date: today,
      timeOut: timeOutStr,
      markedBy: `${req.user?.fullName || 'User'} (Self Clock-Out)`,
    });

    await logUserAction(req, 'UPDATE', 'Attendance', `Employee ${emp.firstName} ${emp.lastName} clocked out at ${timeOutStr}`);

    return res.status(200).json({ success: true, message: `Clock-out recorded at ${timeOutStr}`, record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Clock-out failed.' });
  }
};

export const deleteAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await storage.deleteAttendance(req.params.id);
    await logUserAction(req, 'DELETE', 'Attendance', `Deleted attendance entry ID: ${req.params.id}`);
    return res.status(200).json({ success: true, message: 'Attendance entry deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete attendance.' });
  }
};
