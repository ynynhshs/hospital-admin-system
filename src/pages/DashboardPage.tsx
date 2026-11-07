import React, { useState, useEffect } from 'react';
import {
  Users,
  Droplets,
  CalendarCheck,
  Clock,
  AlertTriangle,
  Building2,
  FileCheck2,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { DashboardData } from '../types/index.ts';
import { dashboardApi, leavesApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onRefreshGlobal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab, onRefreshGlobal }) => {
  const { hasRole } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardApi.getStats();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickLeaveReview = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await leavesApi.review(id, {
        status,
        reviewRemarks: `Quick review from Executive Dashboard`,
      });
      if (res.data.success) {
        setActionMessage(`Leave marked as ${status}.`);
        setTimeout(() => setActionMessage(null), 3000);
        fetchDashboard();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Critical Facility Alert Banner */}
      {stats && stats.criticalLeaks > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Critical Water Leak Alert: {stats.criticalLeaks} Urgent Facility Incident{stats.criticalLeaks > 1 ? 's' : ''} Active
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Chilled water or high pressure plumbing leak flagged near critical medical or diagnostic equipment.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('leaks')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            Manage Facility Leaks
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total Employees</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{stats?.totalEmployees || 0}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {stats?.activeEmployees || 0} active on shift
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-slate-400 group-hover:text-cyan-600 font-medium">
            <span>View HR directory</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Active Plumbing Leaks */}
        <div
          onClick={() => onNavigateTab('leaks')}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Facility Water Leaks</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Droplets className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{stats?.openLeaks || 0}</span>
            <span className="text-xs text-rose-600 font-medium">
              {stats?.criticalLeaks || 0} critical
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-slate-400 group-hover:text-rose-600 font-medium">
            <span>Monitor leak incidents</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Today's Attendance */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Today's Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {stats?.todayAttendance.rate || 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {stats?.todayAttendance.present || 0} present today
            </span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-slate-400 group-hover:text-emerald-600 font-medium">
            <span>View daily timesheet</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Pending Leaves */}
        <div
          onClick={() => onNavigateTab('leaves')}
          className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Pending Leave Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <CalendarCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{stats?.pendingLeaves || 0}</span>
            <span className="text-xs text-amber-600 font-medium">awaiting review</span>
          </div>
          <div className="mt-3 flex items-center text-[11px] text-slate-400 group-hover:text-amber-600 font-medium">
            <span>Review applications</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Middle Row: Active Leaks & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Facility Leaks Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-800">Hospital Water Leak Incidents</h3>
              </div>
              <button
                onClick={() => onNavigateTab('leaks')}
                className="text-xs text-cyan-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {data?.recentLeaks && data.recentLeaks.length > 0 ? (
                data.recentLeaks.map((leak) => (
                  <div key={leak._id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{leak.recordNumber}</span>
                        <StatusBadge status={leak.severity} />
                        <StatusBadge status={leak.status} />
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 truncate">{leak.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {leak.building} • {leak.roomWard} • Est. Loss: {leak.estimatedLossPerHour}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Tech: {leak.technicianAssigned}
                      </span>
                      {leak.isWaterShutoffNeeded && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                          Shutoff Active
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active water leaks reported. All plumbing circuits normal.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Continuous monitoring active</span>
            <button
              onClick={() => onNavigateTab('leaks')}
              className="text-cyan-600 font-semibold hover:underline cursor-pointer"
            >
              + Report New Incident
            </button>
          </div>
        </div>

        {/* Pending Leave Requests with Direct Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-800">Pending Leave Approvals</h3>
              </div>
              <button
                onClick={() => onNavigateTab('leaves')}
                className="text-xs text-cyan-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All Requests</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {data?.pendingLeavesList && data.pendingLeavesList.length > 0 ? (
                data.pendingLeavesList.map((leave) => (
                  <div key={leave._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{leave.employeeName}</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {leave.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-700">{leave.leaveType}</span> ({leave.daysCount} days):{' '}
                        {leave.startDate} to {leave.endDate}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate italic">"{leave.reason}"</p>
                    </div>

                    {hasRole('SuperAdmin', 'Admin', 'HR Manager') ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleQuickLeaveReview(leave._id, 'Approved')}
                          title="Approve leave"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickLeaveReview(leave._id, 'Rejected')}
                          title="Reject leave"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <StatusBadge status={leave.status} />
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending leave applications requiring approval.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Synchronizes automatically with HR roster</span>
            <button
              onClick={() => onNavigateTab('leaves')}
              className="text-cyan-600 font-semibold hover:underline cursor-pointer"
            >
              + Apply for Leave
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Department Distribution & Live Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Departments & Staffing</h3>
            </div>
            <button
              onClick={() => onNavigateTab('departments')}
              className="text-xs text-cyan-600 font-semibold hover:underline cursor-pointer"
            >
              Wards
            </button>
          </div>

          <div className="space-y-3.5 mt-4">
            {data?.departmentDistribution?.map((dept) => {
              const total = stats?.totalEmployees || 1;
              const percent = Math.round((dept.count / total) * 100);

              return (
                <div key={dept.code}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{dept.name}</span>
                    <span className="text-slate-500">
                      {dept.count} staff ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity & Audit Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">Live Hospital Activity & Audit Stream</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-cyan-600 font-semibold hover:underline cursor-pointer"
            >
              Full Audit Trail
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {data?.recentActivity?.slice(0, 6).map((item) => (
              <div key={item._id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.userName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({item.userRole})</span>
                    <StatusBadge status={item.action} dot={false} />
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {item.module}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{item.details}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
