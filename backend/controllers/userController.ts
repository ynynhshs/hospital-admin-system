import { Response } from 'express';
import bcrypt from 'bcryptjs';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await storage.getUsers();
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await storage.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving user.' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, email, role, department, phone, status, password } = req.body;
    const updatePayload: any = {};

    if (fullName) updatePayload.fullName = fullName;
    if (email) updatePayload.email = email.toLowerCase();
    if (role) updatePayload.role = role;
    if (department) updatePayload.department = department;
    if (phone !== undefined) updatePayload.phone = phone;
    if (status) updatePayload.status = status;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }

    const updated = await storage.updateUser(req.params.id, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await logUserAction(
      req,
      'UPDATE',
      'Users',
      `Updated user account ${updated.username} (${updated.role}, status: ${updated.status})`
    );

    return res.status(200).json({ success: true, message: 'User updated successfully.', user: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userToDelete = await storage.getUserById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Protect SuperAdmin default account from being deleted
    if (userToDelete.email === 'admin@hospital.org' || userToDelete.username === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete the primary root SuperAdmin account.' });
    }

    await storage.deleteUser(req.params.id);

    await logUserAction(
      req,
      'DELETE',
      'Users',
      `Deleted user account ${userToDelete.username} (${userToDelete.email})`
    );

    return res.status(200).json({ success: true, message: 'User account deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};
