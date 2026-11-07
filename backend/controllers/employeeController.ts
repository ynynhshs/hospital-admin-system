import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { department, status, search } = req.query;
    const employees = await storage.getEmployees({
      department: department as string,
      status: status as string,
      search: search as string,
    });
    return res.status(200).json({ success: true, count: employees.length, employees });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve employees.' });
  }
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await storage.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.status(200).json({ success: true, employee });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving employee.' });
  }
};

export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      role,
      employmentType,
      dateOfJoining,
      status,
      shift,
      salary,
      emergencyContact,
      address,
      bloodGroup,
      notes,
    } = req.body;

    if (!firstName || !lastName || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, department, and position are required.',
      });
    }

    const employee = await storage.createEmployee({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      department,
      position,
      role: role || position,
      employmentType: employmentType || 'Full-Time',
      dateOfJoining: dateOfJoining || new Date().toISOString().split('T')[0],
      status: status || 'Active',
      shift: shift || 'Morning (07:00 - 15:00)',
      salary: salary ? Number(salary) : 65000,
      emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' },
      address: address || '',
      bloodGroup: bloodGroup || 'O+',
      notes: notes || '',
    });

    await logUserAction(
      req,
      'CREATE',
      'Employees',
      `Registered employee ${employee.firstName} ${employee.lastName} (${employee.employeeId}, ${employee.department})`
    );

    return res.status(201).json({ success: true, message: 'Employee created successfully.', employee });
  } catch (err: any) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create employee.' });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await storage.updateEmployee(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    await logUserAction(
      req,
      'UPDATE',
      'Employees',
      `Updated profile for employee ${updated.firstName} ${updated.lastName} (${updated.employeeId})`
    );

    return res.status(200).json({ success: true, message: 'Employee updated successfully.', employee: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update employee.' });
  }
};

export const deleteEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emp = await storage.getEmployeeById(req.params.id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    await storage.deleteEmployee(req.params.id);

    await logUserAction(
      req,
      'DELETE',
      'Employees',
      `Deleted employee record: ${emp.firstName} ${emp.lastName} (${emp.employeeId})`
    );

    return res.status(200).json({ success: true, message: 'Employee deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete employee.' });
  }
};
