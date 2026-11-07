import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ShieldAlert,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react';
import { EmployeeRecord, DocumentType, VerificationStatus, Employee } from '../types/index.ts';
import { recordsApi, employeesApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface RecordsPageProps {
  onRefreshGlobal?: () => void;
}

export const RecordsPage: React.FC<RecordsPageProps> = ({ onRefreshGlobal }) => {
  const { hasRole, user } = useAuth();
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EmployeeRecord | null>(null);

  const initialForm = {
    employeeCode: '',
    documentType: 'Medical License' as DocumentType,
    documentTitle: '',
    documentNumber: '',
    issueDate: '2024-01-01',
    expiryDate: '2027-01-01',
    verificationStatus: 'Pending Verification' as VerificationStatus,
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await recordsApi.getAll({
        documentType: typeFilter || undefined,
        verificationStatus: statusFilter || undefined,
      });
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeesApi.getAll();
      if (res.data.success) {
        setEmployees(res.data.employees);
        if (res.data.employees.length > 0) {
          setFormData((prev) => ({ ...prev, employeeCode: res.data.employees[0].employeeId }));
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenEdit = (rec: EmployeeRecord) => {
    setSelectedRecord(rec);
    setFormData({
      employeeCode: rec.employeeCode,
      documentType: rec.documentType,
      documentTitle: rec.documentTitle,
      documentNumber: rec.documentNumber,
      issueDate: rec.issueDate,
      expiryDate: rec.expiryDate,
      verificationStatus: rec.verificationStatus,
      notes: rec.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await recordsApi.create(formData);
      if (res.data.success) {
        setIsCreateOpen(false);
        fetchRecords();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating document record');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      const res = await recordsApi.update(selectedRecord._id, formData);
      if (res.data.success) {
        setIsEditOpen(false);
        fetchRecords();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating document record');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete document record: "${title}"?`)) return;
    try {
      await recordsApi.delete(id);
      fetchRecords();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting record');
    }
  };

  // Metrics
  const verifiedCount = records.filter((r) => r.verificationStatus === 'Verified').length;
  const pendingCount = records.filter((r) => r.verificationStatus === 'Pending Verification').length;
  const expiredCount = records.filter((r) => r.verificationStatus === 'Expired').length;
  const rate = records.length > 0 ? Math.round((verifiedCount / records.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Tracked Credentials</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{records.length}</span>
            <span className="text-xs text-slate-400 font-medium">licenses & certificates</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Verified & Active</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{verifiedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">({rate}% compliance)</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Pending Verification</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">requires credential audit</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Expired Licenses</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{expiredCount}</span>
            <span className="text-xs text-rose-600 font-medium">urgent renewal notice</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hospital Medical Credentialing & Documents</h3>
              <p className="text-xs text-slate-500">Board certifications, state medical licenses, BLS/ACLS & compliance records</p>
            </div>
          </div>

          {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document Record</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="">All Credential Categories</option>
            <option value="Medical License">State Medical License (MD/DO/RN)</option>
            <option value="BLS/ACLS Certification">BLS / ACLS Certification</option>
            <option value="DEA Registration">DEA Controlled Substance</option>
            <option value="Employment Contract">Employment Contract</option>
            <option value="Background Check">Background Verification</option>
            <option value="Vaccination Record">Immunization & Titers</option>
            <option value="Academic Degree">Medical Doctorate / Degree</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="">All Verification Statuses</option>
            <option value="Verified">Verified & Valid</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Expired">Expired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Document Title & Number</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No employee document records found matching filters.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {rec.employeeCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {rec.employeeName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{rec.documentTitle}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {rec.documentNumber ? `ID: ${rec.documentNumber}` : 'No Registration #'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {rec.documentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{rec.issueDate || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{rec.expiryDate || 'Indefinite'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rec.verificationStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(rec)}
                              title="Audit & verify status"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rec._id, rec.documentTitle)}
                              title="Delete record"
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

      {/* CREATE RECORD MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Employee Credential / License"
        subtitle="Catalog medical licensure, DEA registrations, and certifications"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
            <select
              value={formData.employeeCode}
              onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              {employees.map((e) => (
                <option key={e.employeeId} value={e.employeeId}>
                  {e.employeeId} - {e.firstName} {e.lastName} ({e.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Type *</label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="Medical License">State Medical License</option>
              <option value="BLS/ACLS Certification">BLS / ACLS Certification</option>
              <option value="DEA Registration">DEA Controlled Substance Registration</option>
              <option value="Employment Contract">Employment Contract</option>
              <option value="Background Check">Background Verification</option>
              <option value="Vaccination Record">Vaccination & Titers Record</option>
              <option value="Academic Degree">Medical School Degree / Diploma</option>
              <option value="National ID / Passport">National ID / Passport</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. State Physician Medical License to Practice"
              value={formData.documentTitle}
              onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">License / Registration Number</label>
            <input
              type="text"
              placeholder="e.g. MD-2026-9912A"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Compliance Notes</label>
            <input
              type="text"
              placeholder="e.g. Verified with State Board online database"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Record Credential
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT / AUDIT VERIFICATION STATUS MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Verify Credential: ${selectedRecord?.documentTitle}`}
        subtitle={`Employee: ${selectedRecord?.employeeName}`}
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Verification Status *</label>
            <select
              value={formData.verificationStatus}
              onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as VerificationStatus })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
            >
              <option value="Verified">Verified - Confirmed active & compliant</option>
              <option value="Pending Verification">Pending Verification - In audit</option>
              <option value="Expired">Expired - Requires renewal</option>
              <option value="Rejected">Rejected - Discrepancy found</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Verification Notes</label>
            <textarea
              rows={3}
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
              Commit Verification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecordsPage;
