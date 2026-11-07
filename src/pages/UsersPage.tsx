import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search, Edit, Trash2, Key, UserCheck, ShieldAlert } from 'lucide-react';
import { User, UserRole, UserStatus } from '../types/index.ts';
import { usersApi, authApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const UsersPage: React.FC = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const initialForm = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'Staff' as UserRole,
    department: 'General Administration',
    phone: '',
    status: 'Active' as UserStatus,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await usersApi.getAll();
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (u: User) => {
    setSelectedUser(u);
    setFormData({
      username: u.username,
      email: u.email,
      password: '',
      fullName: u.fullName,
      role: u.role,
      department: u.department,
      phone: u.phone || '',
      status: u.status,
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.register(formData);
      if (res.data.success) {
        setIsCreateOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering user.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await usersApi.update(selectedUser._id, formData);
      if (res.data.success) {
        setIsEditOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Delete user account ${email}?`)) return;
    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">User Accounts & Role Permissions</h3>
            <p className="text-xs text-slate-500">Manage security credentials, role assignment and status access</p>
          </div>
        </div>

        {hasRole('SuperAdmin', 'Admin') && (
          <button
            onClick={() => {
              setFormData(initialForm);
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role Access</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">{u.fullName}</span>
                          <span className="text-[11px] font-mono text-slate-400">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.department}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasRole('SuperAdmin', 'Admin') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit user role & status"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {u.email !== 'admin@hospital.org' && (
                              <button
                                onClick={() => handleDelete(u._id, u.email)}
                                title="Delete account"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register System User"
        subtitle="Provision employee login credentials and security role"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="Staff">Staff</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Register User
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit User Account: ${selectedUser?.username}`}
        subtitle="Update role permissions, account status, or reset credentials"
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="Staff">Staff</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reset Password (leave empty to keep)</label>
            <input
              type="password"
              placeholder="Enter new password if changing"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              Save Account Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
