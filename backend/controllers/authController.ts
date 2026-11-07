import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import storage from '../storage.ts';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password.' });
    }

    const user = await storage.getUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'Suspended' || user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Account is inactive or suspended. Please contact HR/Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Update lastLogin
    await storage.updateUser(user._id.toString(), { lastLogin: new Date() });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: user.status,
      avatar: user.avatar,
    };

    // Log login activity
    await storage.createAuditLog({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'LOGIN',
      module: 'Auth',
      details: `User logged in successfully with role [${user.role}]`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, password, fullName, role, department, phone } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Username, email, password, and full name are required.' });
    }

    const existing = await storage.getUserByEmailOrUsername(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const existingUser = await storage.getUserByEmailOrUsername(username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await storage.createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      fullName: fullName.trim(),
      role: role || 'Staff',
      department: department || 'General Administration',
      phone: phone || '',
      status: 'Active',
    });

    await logUserAction(req, 'CREATE', 'Users', `Created user account: ${username} (${role || 'Staff'})`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: newUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Error registering user.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await storage.getUserByEmailOrUsername(req.user!.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await storage.updateUser(req.user!.id, { password: hashedPassword });
    await logUserAction(req, 'UPDATE', 'Auth', `User ${req.user!.username} changed account password.`);

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error changing password.' });
  }
};
