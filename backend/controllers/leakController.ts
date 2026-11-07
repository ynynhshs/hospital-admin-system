import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getLeakRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, severity, search } = req.query;
    const leaks = await storage.getLeakRecords({
      status: status as string,
      severity: severity as string,
      search: search as string,
    });

    const totalOpen = leaks.filter((l) => l.status !== 'Resolved' && l.status !== 'Closed').length;
    const criticalCount = leaks.filter((l) => l.severity === 'Critical' && l.status !== 'Closed').length;

    return res.status(200).json({
      success: true,
      count: leaks.length,
      metrics: { totalOpen, criticalCount },
      leaks,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve leak records.' });
  }
};

export const getLeakRecordById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leak = await storage.getLeakRecordById(req.params.id);
    if (!leak) {
      return res.status(404).json({ success: false, message: 'Leak record not found.' });
    }
    return res.status(200).json({ success: true, leak });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving leak record.' });
  }
};

export const createLeakRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      building,
      floor,
      roomWard,
      pipeSystem,
      waterSource,
      severity,
      estimatedLossPerHour,
      reportedBy,
      technicianAssigned,
      isWaterShutoffNeeded,
      equipmentRisk,
      notes,
    } = req.body;

    if (!title || !building || !roomWard || !waterSource) {
      return res.status(400).json({
        success: false,
        message: 'Title, building, room/ward, and water source are required.',
      });
    }

    const reporter = reportedBy || req.user?.fullName || 'Hospital Staff';

    const newRecord = await storage.createLeakRecord({
      title,
      building,
      floor: floor || 'Ground Floor',
      roomWard,
      pipeSystem: pipeSystem || 'Potable Water Supply',
      waterSource,
      severity: severity || 'Medium',
      estimatedLossPerHour: estimatedLossPerHour || '5 Liters/hr',
      reportedBy: reporter,
      technicianAssigned: technicianAssigned || 'Unassigned',
      isWaterShutoffNeeded: Boolean(isWaterShutoffNeeded),
      equipmentRisk: equipmentRisk || 'None',
      notes: notes || '',
    });

    await logUserAction(
      req,
      'CREATE',
      'Leak Detection',
      `Logged water leak incident ${newRecord.recordNumber} at ${newRecord.roomWard} (${newRecord.severity} severity)`
    );

    return res.status(201).json({
      success: true,
      message: 'Water leak incident logged and dispatched.',
      leak: newRecord,
    });
  } catch (err: any) {
    console.error('Error logging leak record:', err);
    return res.status(500).json({ success: false, message: 'Failed to create leak record.' });
  }
};

export const updateLeakRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const existing = await storage.getLeakRecordById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Leak record not found.' });
    }

    const payload = { ...req.body };
    if (payload.status === 'Resolved' && !payload.resolvedDate) {
      payload.resolvedDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }

    const updated = await storage.updateLeakRecord(req.params.id, payload);

    await logUserAction(
      req,
      'UPDATE',
      'Leak Detection',
      `Updated leak incident ${updated.recordNumber}: status [${updated.status}], technician: ${updated.technicianAssigned}`
    );

    return res.status(200).json({ success: true, message: 'Leak record updated successfully.', leak: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update leak record.' });
  }
};

export const deleteLeakRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leak = await storage.getLeakRecordById(req.params.id);
    if (!leak) {
      return res.status(404).json({ success: false, message: 'Leak record not found.' });
    }

    await storage.deleteLeakRecord(req.params.id);

    await logUserAction(
      req,
      'DELETE',
      'Leak Detection',
      `Deleted leak record ${leak.recordNumber} (${leak.roomWard})`
    );

    return res.status(200).json({ success: true, message: 'Leak incident record deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete leak record.' });
  }
};
