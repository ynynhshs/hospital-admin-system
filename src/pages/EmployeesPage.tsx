import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react';
import { Employee } from '../types/index.ts';
import { employeesApi, departmentsApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface EmployeesPageProps {
  onRefreshGlobal?: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ onRefreshGlobal }) => {
  const { hasRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Emergency Medicine',
    position: 'Staff Nurse',
    role: 'Clinical Staff',
    employmentType: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern',
    dateOfJoining: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'On Leave' | 'Terminated',
    shift: 'Morning (07:00 - 15:00)',
    salary: 75000,
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    address: '',
    bloodGroup: 'O+',
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await employeesApi.getAll({
        search: searchTerm || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      });
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentsApi.getAll();
      if (res.data.success) {
        setDepartments(res.data.departments.map((d: any) => d.name));
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [searchTerm, departmentFilter, statusFilter]);

  const handleOpenCreate = () => {
    setFormData(initialForm);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      role: emp.role || emp.position,
      employmentType: emp.employmentType,
      dateOfJoining: emp.dateOfJoining,
      status: emp.status,
      shift: emp.shift,
      salary: emp.salary,
      emergencyContact: emp.emergencyContact || { name: '', relationship: '', phone: '' },
      address: emp.address || '',
      bloodGroup: emp.bloodGroup || 'O+',
      notes: emp.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsViewOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await employeesApi.create(formData);
      if (res.data.success) {
        setIsCreateOpen(false);
        fetchEmployees();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating employee.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    try {
      const res = await employeesApi.update(selectedEmployee._id, formData);
      if (res.data.success) {
        setIsEditOpen(false);
        fetchEmployees();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating employee.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee record for ${name}?`)) {
      return;
    }
    try {
      const res = await employeesApi.delete(id);
      if (res.data.success) {
        fetchEmployees();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting employee.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hospital Staff & Human Resources</h3>
              <p className="text-xs text-slate-500">Clinical personnel, physicians, nurses, technicians & admin roster</p>
            </div>
          </div>

          {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          )}
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-700 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-700 font-medium"
          >
            <option value="">All Employment Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Position</th>
                <th className="py-3 px-4">Shift & Schedule</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No employee records match current search filters.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold font-mono text-teal-800">
                      {emp.employeeId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                          {emp.firstName.charAt(0)}
                          {emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400">{emp.employmentType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 block">{emp.position}</span>
                      <span className="text-[11px] text-slate-500">{emp.department}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium block">{emp.shift}</span>
                      <span className="text-[10px] text-slate-400">Joined: {emp.dateOfJoining}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 block">{emp.email}</span>
                      <span className="text-[11px] text-slate-400">{emp.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(emp)}
                          title="View complete profile card"
                          className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              title="Edit profile & role"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)}
                              title="Delete employee record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Hospital Employee Profile"
        subtitle="Register new clinical, surgical, facility, or administrative staff"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Position *</label>
              <input
                type="text"
                required
                placeholder="e.g. Registered Nurse (BSN)"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift Schedule</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                <option value="Night (23:00 - 07:00)">Night (23:00 - 07:00)</option>
                <option value="Day Shift (08:00 - 17:00)">Day Shift (08:00 - 17:00)</option>
                <option value="Rotating">Rotating On-Call</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Salary ($)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">Emergency Contact</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={formData.emergencyContact.relationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <input
                type="text"
                placeholder="Emergency Phone"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Create Employee Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Profile: ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
        subtitle={`Employee ID: ${selectedEmployee?.employeeId}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              >
                <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                <option value="Night (23:00 - 07:00)">Night (23:00 - 07:00)</option>
                <option value="Day Shift (08:00 - 17:00)">Day Shift (08:00 - 17:00)</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical / Administrative Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW EMPLOYEE CARD MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Hospital Personnel Dossier"
        subtitle={`Staff Record: ${selectedEmployee?.employeeId}`}
        maxWidth="lg"
      >
        {selectedEmployee && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                {selectedEmployee.firstName.charAt(0)}
                {selectedEmployee.lastName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-800">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h4>
                  <StatusBadge status={selectedEmployee.status} />
                </div>
                <p className="text-xs font-semibold text-teal-700 mt-0.5">{selectedEmployee.position}</p>
                <p className="text-[11px] text-slate-500">{selectedEmployee.department} • Blood: {selectedEmployee.bloodGroup}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                <span className="text-slate-800 font-medium truncate block">{selectedEmployee.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                <span className="text-slate-800 font-medium">{selectedEmployee.phone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Shift</span>
                <span className="text-slate-800 font-medium">{selectedEmployee.shift}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Joined</span>
                <span className="text-slate-800 font-medium">{selectedEmployee.dateOfJoining}</span>
              </div>
            </div>

            {selectedEmployee.emergencyContact && selectedEmployee.emergencyContact.name && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-bold text-amber-800 block mb-0.5">Emergency Contact</span>
                <p className="text-amber-950 font-medium">
                  {selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relationship}) —{' '}
                  {selectedEmployee.emergencyContact.phone}
                </p>
              </div>
            )}

            {selectedEmployee.notes && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Administrative Notes</span>
                <p className="text-slate-700 italic">{selectedEmployee.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeesPage;
