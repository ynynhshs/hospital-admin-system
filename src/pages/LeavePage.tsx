import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  User,
  Trash2,
} from 'lucide-react';
import { Leave, LeaveStatus, LeaveType, Employee } from '../types/index.ts';
import { leavesApi, employeesApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface LeavePageProps {
  onRefreshGlobal?: () => void;
}

export const LeavePage: React.FC<LeavePageProps> = ({ onRefreshGlobal }) => {
  const { hasRole, user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Form State
  const initialForm = {
    employeeCode: '',
    leaveType: 'Annual' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    reason: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await leavesApi.getAll({
        status: statusFilter || undefined,
        leaveType: typeFilter || undefined,
      });
      if (res.data.success) {
        setLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
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
    fetchLeaves();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenReview = (leave: Leave, defaultStatus: 'Approved' | 'Rejected') => {
    setSelectedLeave(leave);
    setReviewStatus(defaultStatus);
    setReviewRemarks(
      defaultStatus === 'Approved' ? 'Approved by Clinical Operations' : 'Rejected due to shift staffing constraints'
    );
    setIsReviewModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await leavesApi.apply(formData);
      if (res.data.success) {
        setIsApplyModalOpen(false);
        fetchLeaves();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting leave application');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      const res = await leavesApi.review(selectedLeave._id, {
        status: reviewStatus,
        reviewRemarks,
      });
      if (res.data.success) {
        setIsReviewModalOpen(false);
        fetchLeaves();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error reviewing leave application');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this leave application?')) return;
    try {
      await leavesApi.delete(id);
      fetchLeaves();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting leave record');
    }
  };

  // Metrics
  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;
  const totalDays = leaves.filter((l) => l.status === 'Approved').reduce((acc, l) => acc + l.daysCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Pending Approval</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-xs text-amber-600 font-medium">applications queued</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Approved Requests</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{approvedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">scheduled</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Approved Days</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{totalDays}</span>
            <span className="text-xs text-slate-400 font-medium">hospital days off</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Rejected Requests</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{rejectedCount}</span>
            <span className="text-xs text-slate-400 font-medium">staff shortages</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <CalendarDays className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hospital Leave Requests & Roster Approvals</h3>
              <p className="text-xs text-slate-500">Annual vacation, medical sick leave, emergency leave & academic conferences</p>
            </div>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="">All Review Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="">All Leave Categories</option>
            <option value="Annual">Annual Vacation</option>
            <option value="Sick">Medical / Sick Leave</option>
            <option value="Maternity">Maternity / Parental</option>
            <option value="Emergency">Emergency</option>
            <option value="Casual">Casual</option>
            <option value="Study / Conference">Study / Clinical Conference</option>
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Category</th>
                <th className="py-3 px-4">Duration & Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reviewed By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leave requests matching current filters.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {leave.employeeCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{leave.employeeName}</span>
                      <span className="text-[11px] text-slate-500">{leave.department}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {leave.leaveType}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{leave.daysCount} days</span>
                      <span className="text-[11px] text-slate-500">
                        {leave.startDate} to {leave.endDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {leave.reviewedBy ? (
                        <div>
                          <span className="font-medium text-slate-700 block">{leave.reviewedBy}</span>
                          <span className="text-[10px] text-slate-400">{leave.reviewedDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending supervisor</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasRole('SuperAdmin', 'Admin', 'HR Manager') && leave.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleOpenReview(leave, 'Approved')}
                              className="px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenReview(leave, 'Rejected')}
                              className="px-2 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
                          <button
                            onClick={() => handleDelete(leave._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* APPLY FOR LEAVE MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        subtitle="Request planned vacation, sick absence or conference attendance"
        maxWidth="md"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Applying Employee *</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="Annual">Annual Paid Vacation</option>
              <option value="Sick">Medical / Sick Leave</option>
              <option value="Maternity">Maternity / Paternity Leave</option>
              <option value="Emergency">Emergency Family Leave</option>
              <option value="Casual">Casual Day Off</option>
              <option value="Study / Conference">Study / Clinical Medical Conference</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason / Clinical Handover Note *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Scheduled annual holiday. Patient coverage handed over to Dr. Gregory Thorne."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* REVIEW LEAVE MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review Leave: ${selectedLeave?.employeeName}`}
        subtitle={`${selectedLeave?.leaveType} (${selectedLeave?.daysCount} days)`}
        maxWidth="md"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Review Decision *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewStatus('Approved')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  reviewStatus === 'Approved'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewStatus('Rejected')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  reviewStatus === 'Rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Request</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Review Remarks & Stipulations</label>
            <textarea
              rows={3}
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Commit Decision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeavePage;
