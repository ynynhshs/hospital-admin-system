import { AuthenticatedRequest } from './auth.ts';
import storage from '../storage.ts';

export const logUserAction = async (
  req: AuthenticatedRequest,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'APPROVE' | 'REJECT' | 'EXPORT',
  module:
    | 'Auth'
    | 'Users'
    | 'Employees'
    | 'Departments'
    | 'Leak Detection'
    | 'Attendance'
    | 'Leave'
    | 'Documents'
    | 'Reports'
    | 'System',
  details: string
) => {
  try {
    const userName = req.user?.fullName || 'System Automated';
    const userRole = req.user?.role || 'System';
    const userId = req.user?.id || '';
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    await storage.createAuditLog({
      userId,
      userName,
      userRole,
      action,
      module,
      details,
      ipAddress: ipAddress.includes('::ffff:') ? ipAddress.replace('::ffff:', '') : ipAddress,
    });
  } catch (err) {
    console.error('Failed to log audit activity:', err);
  }
};
