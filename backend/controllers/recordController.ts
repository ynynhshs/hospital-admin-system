import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getEmployeeRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentType, verificationStatus, employeeCode } = req.query;
    const records = await storage.getEmployeeRecords({
      documentType: documentType as string,
      verificationStatus: verificationStatus as string,
      employeeCode: employeeCode as string,
    });

    const verifiedCount = records.filter((r) => r.verificationStatus === 'Verified').length;
    const pendingCount = records.filter((r) => r.verificationStatus === 'Pending Verification').length;
    const expiredCount = records.filter((r) => r.verificationStatus === 'Expired').length;

    return res.status(200).json({
      success: true,
      count: records.length,
      metrics: { verifiedCount, pendingCount, expiredCount },
      records,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve records.' });
  }
};

export const createEmployeeRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      employeeCode,
      documentType,
      documentTitle,
      documentNumber,
      issueDate,
      expiryDate,
      verificationStatus,
      notes,
    } = req.body;

    if (!employeeCode || !documentType || !documentTitle) {
      return res.status(400).json({
        success: false,
        message: 'Employee code, document type, and document title are required.',
      });
    }

    const emp = await storage.getEmployeeById(employeeCode);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const newRecord = await storage.createEmployeeRecord({
      employeeId: emp._id.toString(),
      employeeCode: emp.employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      documentType,
      documentTitle,
      documentNumber: documentNumber || '',
      issueDate: issueDate || '',
      expiryDate: expiryDate || '',
      verificationStatus: verificationStatus || 'Pending Verification',
      notes: notes || '',
      fileUrl: `/uploads/${documentType.toLowerCase().replace(/[^a-z0-9]/g, '_')}_sample.pdf`,
      fileSize: '1.4 MB',
      uploadedBy: req.user?.fullName || 'HR Administrator',
    });

    await logUserAction(
      req,
      'CREATE',
      'Documents',
      `Uploaded credential ${documentTitle} (${documentType}) for ${emp.firstName} ${emp.lastName}`
    );

    return res.status(201).json({
      success: true,
      message: 'Employee record uploaded successfully.',
      record: newRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create employee record.' });
  }
};

export const updateEmployeeRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateEmployeeRecord(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    await logUserAction(
      req,
      'UPDATE',
      'Documents',
      `Updated credential ${updated.documentTitle} status to [${updated.verificationStatus}]`
    );

    return res.status(200).json({ success: true, message: 'Record updated successfully.', record: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update record.' });
  }
};

export const deleteEmployeeRecord = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await storage.getEmployeeRecords();
    const target = records.find((r) => r._id === req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Record not found.' });
    }

    await storage.deleteEmployeeRecord(req.params.id);
    await logUserAction(req, 'DELETE', 'Documents', `Deleted document ${target.documentTitle} for ${target.employeeName}`);

    return res.status(200).json({ success: true, message: 'Record deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
};
