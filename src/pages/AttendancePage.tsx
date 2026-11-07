import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  UserCheck,
  Building2,
  Trash2,
} from 'lucide-react';
import { Attendance, AttendanceStatus, Employee } from '../types/index.ts';
import { attendanceApi, employeesApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface AttendancePageProps {
  onRefreshGlobal?: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ onRefreshGlobal }) => {
  const { hasRole, user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [formEmployeeCode, setFormEmployeeCode] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formTimeIn, setFormTimeIn] = useState('07:00 AM');
  const [formTimeOut, setFormTimeOut] = useState('03:30 PM');
  const [formStatus, setFormStatus] = useState<AttendanceStatus>('Present');
  const [formWorkHours, setFormWorkHours] = useState(8);
  const [formOvertimeHours, setFormOvertimeHours] = useState(0);
  const [formShift, setFormShift] = useState('Morning (07:00 - 15:00)');
  const [formRemarks, setFormRemarks] = useState('');

  const [clockStatus, setClockStatus] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getAll({
        date: selectedDate || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      });
      if (res.data.success) {
        setAttendance(res.data.attendance);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeesApi.getAll();
      if (res.data.success) {
        setEmployees(res.data.employees);
        if (res.data.employees.length > 0 && !formEmployeeCode) {
          setFormEmployeeCode(res.data.employees[0].employeeId);
        }
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSelfClock = async (type: 'in' | 'out') => {
    try {
      const res = type === 'in' ? await attendanceApi.clockIn() : await attendanceApi.clockOut();
      if (res.data.success) {
        setClockStatus(res.data.message);
        setTimeout(() => setClockStatus(null), 4000);
        fetchAttendance();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Clock action failed');
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await attendanceApi.record({
        employeeCode: formEmployeeCode,
        date: formDate,
        timeIn: formTimeIn,
        timeOut: formTimeOut,
        status: formStatus,
        workHours: formWorkHours,
        overtimeHours: formOvertimeHours,
        shift: formShift,
        remarks: formRemarks,
      });

      if (res.data.success) {
        setIsRecordModalOpen(false);
        fetchAttendance();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording attendance');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceApi.delete(id);
      fetchAttendance();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting attendance');
    }
  };

  // Metrics
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const lateCount = attendance.filter((a) => a.status === 'Late').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const totalOvertime = attendance.reduce((acc, a) => acc + (a.overtimeHours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Attendance KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Present on Shift</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{presentCount}</span>
            <span className="text-xs text-slate-400 font-medium">staff members</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Late Arrivals</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{lateCount}</span>
            <span className="text-xs text-amber-600 font-medium">&gt; 15 mins delay</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Recorded Absences</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{absentCount}</span>
            <span className="text-xs text-slate-400 font-medium">unexcused / off</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Overtime Hours</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-600">{totalOvertime} hrs</span>
            <span className="text-xs text-indigo-500 font-medium">shift extensions</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Quick Biometric Simulation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Hospital Daily Timesheets & Clock Records</h3>
            <p className="text-xs text-slate-500">Biometric terminals, scheduled ward shifts, and attendance verification</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Self-Service Clocking Buttons */}
            <button
              onClick={() => handleSelfClock('in')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Clock In Now</span>
            </button>
            <button
              onClick={() => handleSelfClock('out')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Clock Out</span>
            </button>

            {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
              <button
                onClick={() => setIsRecordModalOpen(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Manual Override</span>
              </button>
            )}
          </div>
        </div>

        {clockStatus && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
            {clockStatus}
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="">All Departments</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Surgical Services & OR">Surgical Services & OR</option>
              <option value="Facilities & Maintenance">Facilities & Maintenance</option>
              <option value="Cardiology & Catheterization">Cardiology & Catheterization</option>
              <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Attendance Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Code</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department & Shift</th>
                <th className="py-3 px-4">Time In</th>
                <th className="py-3 px-4">Time Out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Hours / OT</th>
                <th className="py-3 px-4">Terminal / Logged By</th>
                {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
                  <th className="py-3 px-4 text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No attendance records found for selected date ({selectedDate}).
                  </td>
                </tr>
              ) : (
                attendance.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {att.employeeCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {att.employeeName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 block font-medium">{att.department}</span>
                      <span className="text-[10px] text-slate-400">{att.shift}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {att.timeIn || '--:--'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {att.timeOut || '--:--'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={att.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{att.workHours} hrs</span>
                      {att.overtimeHours > 0 && (
                        <span className="block text-[10px] text-indigo-600 font-bold">
                          +{att.overtimeHours}h Overtime
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {att.markedBy}
                      {att.remarks && (
                        <span className="block text-[10px] text-slate-400 italic">"{att.remarks}"</span>
                      )}
                    </td>
                    {hasRole('SuperAdmin', 'Admin', 'HR Manager') && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(att._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL ATTENDANCE OVERRIDE MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Manual Attendance Override"
        subtitle="Record supervisor shift verification or correct timesheet discrepancy"
        maxWidth="md"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Employee *</label>
            <select
              value={formEmployeeCode}
              onChange={(e) => setFormEmployeeCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              {employees.map((e) => (
                <option key={e.employeeId} value={e.employeeId}>
                  {e.employeeId} - {e.firstName} {e.lastName} ({e.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status *</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time In</label>
              <input
                type="text"
                placeholder="07:00 AM"
                value={formTimeIn}
                onChange={(e) => setFormTimeIn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Out</label>
              <input
                type="text"
                placeholder="03:30 PM"
                value={formTimeOut}
                onChange={(e) => setFormTimeOut(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Work Hours</label>
              <input
                type="number"
                value={formWorkHours}
                onChange={(e) => setFormWorkHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Overtime Hours</label>
              <input
                type="number"
                step="0.5"
                value={formOvertimeHours}
                onChange={(e) => setFormOvertimeHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supervisor Remarks</label>
            <input
              type="text"
              placeholder="e.g. Overtime approved for trauma unit emergency surge"
              value={formRemarks}
              onChange={(e) => setFormRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Record Timesheet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
