import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, DollarSign, Phone, Layers, Edit, Trash2 } from 'lucide-react';
import { Department } from '../types/index.ts';
import { departmentsApi } from '../api/client.ts';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const DepartmentsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const initialForm = {
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    floor: 'Ground Floor',
    budget: 500000,
    extension: '100',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await departmentsApi.getAll();
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setIsEditing(true);
    setCurrentId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headOfDepartment: dept.headOfDepartment,
      floor: dept.floor,
      budget: dept.budget,
      extension: dept.extension,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        await departmentsApi.update(currentId, formData);
      } else {
        await departmentsApi.create(formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving department');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete department: ${name}?`)) return;
    try {
      await departmentsApi.delete(id);
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Hospital Clinical Wards & Administrative Units</h3>
            <p className="text-xs text-slate-500">Manage department codes, staffing capacity, budgets and extensions</p>
          </div>
        </div>

        {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Department</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                    {dept.code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 mt-1">{dept.name}</h4>
                </div>
                {hasRole('SuperAdmin', 'Admin') && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id, dept.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{dept.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Head of Unit:</span>
                <span className="font-semibold text-slate-800">{dept.headOfDepartment}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Location:</span>
                <span>{dept.floor}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Active Staff:</span>
                <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {dept.activeEmployeesCount} on duty
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Extension:</span>
                <span className="font-mono text-slate-700">Ext #{dept.extension}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Department / Ward' : 'Create New Department'}
        subtitle="Manage hospital administrative and clinical services"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pediatrics & Neonatal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Code (Uppercase) *</label>
              <input
                type="text"
                required
                placeholder="e.g. PED"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Extension</label>
              <input
                type="text"
                placeholder="e.g. 501"
                value={formData.extension}
                onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Head of Department / Clinical Lead</label>
            <input
              type="text"
              placeholder="e.g. Dr. Alistair Chen"
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor / Ward Location</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Budget ($)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
