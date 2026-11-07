import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, leaveType, department, employeeCode } = req.query;
    const leaves = await storage.getLeaves({
      status: status as string,
      leaveType: leaveType as string,
      department: department as string,
      employeeCode: employeeCode as string,
    });

    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'Approved').length;

    return res.status(200).json({
      success: true,
      count: leaves.length,
      metrics: { pendingCount, approvedCount },
      leaves,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave records.' });
  }
};

export const applyLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { employeeCode, leaveType, startDate, endDate, reason } = req.body;

    if (!employeeCode || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Employee code, leave type, start date, end date, and reason are required.',
      });
    }

    const emp = await storage.getEmployeeById(employeeCode);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const newLeave = await storage.createLeave({
      employeeId: emp._id.toString(),
      employeeCode: emp.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'Pending',
    });

    await logUserAction(
      req,
      'CREATE',
      'Leave',
      `Submitted ${leaveType} leave application for ${emp.firstName} ${emp.lastName} (${daysCount} days)`
    );

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave: newLeave,
    });
  } catch (err: any) {
    console.error('Error applying for leave:', err);
    return res.status(500).json({ success: false, message: 'Failed to apply for leave.' });
  }
};

export const reviewLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, reviewRemarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Review status must be either Approved or Rejected.' });
    }

    const leaves = await storage.getLeaves();
    const existing = leaves.find((l) => l._id === req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Leave application not found.' });
    }

    const reviewedDate = new Date().toISOString().split('T')[0];
    const reviewer = req.user?.fullName || 'HR Manager';

    const updated = await storage.updateLeave(req.params.id, {
      status,
      reviewedBy: reviewer,
      reviewedDate,
      reviewRemarks: reviewRemarks || '',
    });

    // If approved and current date falls within range, update employee status to 'On Leave'
    if (status === 'Approved') {
      const today = new Date().toISOString().split('T')[0];
      if (today >= existing.startDate && today <= existing.endDate) {
        await storage.updateEmployee(existing.employeeId, { status: 'On Leave' });
      }
    }

    await logUserAction(
      req,
      status === 'Approved' ? 'APPROVE' : 'REJECT',
      'Leave',
      `${status} leave for ${existing.employeeName} (${existing.leaveType}, ${existing.daysCount} days). Remarks: ${reviewRemarks || 'None'}`
    );

    return res.status(200).json({
      success: true,
      message: `Leave application marked as ${status}.`,
      leave: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to review leave application.' });
  }
};

export const deleteLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await storage.deleteLeave(req.params.id);
    await logUserAction(req, 'DELETE', 'Leave', `Deleted leave record ID: ${req.params.id}`);
    return res.status(200).json({ success: true, message: 'Leave record deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete leave.' });
  }
};
