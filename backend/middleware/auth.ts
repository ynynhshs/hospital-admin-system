import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import storage from '../storage.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_hospital_jwt_secret_2026_xyz';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'SuperAdmin' | 'Admin' | 'HR Manager' | 'Facility Manager' | 'Staff';
    department: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found or has been removed.' });
    }

    if (user.status === 'Suspended' || user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is inactive or suspended. Contact Administrator.' });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
    };

    next();
  } catch (err: any) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access.' });
    }

    // SuperAdmin has full bypass privileges
    if (req.user.role === 'SuperAdmin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of [${allowedRoles.join(', ')}] role.`,
      });
    }

    next();
  };
};
