import { Response } from 'express';
import storage from '../storage.ts';
import { getDBStatus } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await storage.getDashboardMetrics();
    const dbStatus = getDBStatus();

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        database: dbStatus,
      },
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
};

export const getSystemStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dbStatus = getDBStatus();
    const employees = await storage.getEmployees();
    const leaks = await storage.getLeakRecords();
    const users = await storage.getUsers();

    return res.status(200).json({
      success: true,
      status: {
        database: dbStatus,
        version: '2.4.0',
        environment: process.env.NODE_ENV || 'development',
        counts: {
          users: users.length,
          employees: employees.length,
          leakRecords: leaks.length,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve system status.' });
  }
};

export const resetOrSeedDB = async (req: AuthenticatedRequest, res: Response) => {
  try {
    storage.seedInitialData();
    await logUserAction(req, 'UPDATE', 'System', 'Re-initialized hospital database with standard baseline seed data.');

    return res.status(200).json({
      success: true,
      message: 'Database seed completed successfully with baseline records.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Database reset failed.' });
  }
};
