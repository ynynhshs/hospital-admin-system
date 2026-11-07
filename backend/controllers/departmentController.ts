import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getDepartments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const departments = await storage.getDepartments();
    // Compute current live employee counts for each department
    const employees = await storage.getEmployees();
    const enriched = departments.map((d) => {
      const activeCount = employees.filter((e) => e.department === d.name && e.status === 'Active').length;
      return {
        ...d,
        activeEmployeesCount: activeCount,
      };
    });
    return res.status(200).json({ success: true, count: enriched.length, departments: enriched });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments.' });
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, code, description, headOfDepartment, floor, budget, extension } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const dept = await storage.createDepartment({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      headOfDepartment: headOfDepartment || 'Unassigned',
      floor: floor || 'Ground Floor',
      budget: budget ? Number(budget) : 250000,
      extension: extension || '100',
    });

    await logUserAction(req, 'CREATE', 'Departments', `Created department ${dept.name} (${dept.code})`);
    return res.status(201).json({ success: true, message: 'Department created successfully.', department: dept });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
};

export const updateDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateDepartment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await logUserAction(req, 'UPDATE', 'Departments', `Updated department ${updated.name} (${updated.code})`);
    return res.status(200).json({ success: true, message: 'Department updated.', department: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
};

export const deleteDepartment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const depts = await storage.getDepartments();
    const d = depts.find((x) => x._id === req.params.id);
    if (!d) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await storage.deleteDepartment(req.params.id);
    await logUserAction(req, 'DELETE', 'Departments', `Deleted department ${d.name}`);
    return res.status(200).json({ success: true, message: 'Department deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
};
