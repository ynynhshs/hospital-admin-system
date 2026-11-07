import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Database,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { attendanceApi } from '../api/client.ts';

interface HeaderProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  openLeaksCount?: number;
  dbStatus?: {
    isConnected: boolean;
    mode: string;
    uriConfigured: boolean;
  };
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  openLeaksCount = 0,
  dbStatus,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const [clockLoading, setClockLoading] = useState(false);
  const [clockMessage, setClockMessage] = useState<string | null>(null);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Hospital Dashboard', subtitle: 'Real-time overview of staffing, clinical operations & facilities' },
    leaks: { title: 'Facility Plumbing & Leak Detection', subtitle: 'Water monitoring, emergency shutoff status & repair dispatch' },
    employees: { title: 'Human Resources & Employee Directory', subtitle: 'Staff profiles, clinical roles, shifts, and department assignments' },
    departments: { title: 'Departments & Clinical Wards', subtitle: 'Bed allocation, budgets, supervision, and unit extension lines' },
    attendance: { title: 'Staff Attendance & Shift Logs', subtitle: 'Biometric time-in, clock-out, overtime tracking, and timesheets' },
    leaves: { title: 'Leave Management & Approvals', subtitle: 'Medical leave requests, annual vacations, approvals, and balance history' },
    records: { title: 'Employee Records & Credentialing', subtitle: 'Medical licenses, BLS/ACLS certifications, and compliance verification' },
    reports: { title: 'Reports & Analytics Generator', subtitle: 'Export printable census, timesheets, leave utilization, and leak records' },
    users: { title: 'User Accounts & Access Control', subtitle: 'System credentials, role permissions, and administrative account security' },
    audit: { title: 'Security Audit Trail', subtitle: 'Chronological activity logs of all hospital records, reviews, and modifications' },
    settings: { title: 'System Settings & Database', subtitle: 'MongoDB Atlas connection parameters, seed synchronization & system info' },
  };

  const currentMeta = tabTitles[currentTab] || { title: 'Hospital Administration', subtitle: 'MedAdmin Operations Portal' };

  const handleQuickClock = async (action: 'in' | 'out') => {
    try {
      setClockLoading(true);
      const res = action === 'in' ? await attendanceApi.clockIn() : await attendanceApi.clockOut();
      if (res.data.success) {
        setClockMessage(res.data.message);
        setTimeout(() => setClockMessage(null), 4000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      setClockMessage(err.response?.data?.message || 'Clock action failed');
      setTimeout(() => setClockMessage(null), 4000);
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <header className="h-18 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between z-10 shrink-0">
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{currentMeta.title}</h2>
        <p className="text-xs text-slate-500 font-medium">{currentMeta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Urgent Leak Alert Indicator */}
        {openLeaksCount > 0 && (
          <button
            onClick={() => onNavigateTab('leaks')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer text-xs font-semibold animate-pulse"
          >
            <Droplets className="w-3.5 h-3.5 text-rose-600" />
            <span>{openLeaksCount} Active Leak{openLeaksCount > 1 ? 's' : ''} Detected</span>
          </button>
        )}

        {/* Database Status Indicator */}
        <div
          title={dbStatus?.isConnected ? 'MongoDB Atlas Connected' : 'Persistent Storage Active (MongoDB Atlas Ready)'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            dbStatus?.isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <Database className={`w-3.5 h-3.5 ${dbStatus?.isConnected ? 'text-emerald-600' : 'text-cyan-600'}`} />
          <span className="hidden sm:inline">
            {dbStatus?.isConnected ? 'MongoDB Atlas' : 'MongoDB Store'}
          </span>
          <span className={`w-2 h-2 rounded-full ${dbStatus?.isConnected ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
        </div>

        {/* Download ZIP Button */}
        <a
          href="/api/system/download-zip"
          download="hospital-admin-system.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          title="Download entire project source code (.zip)"
        >
          <Download className="w-3.5 h-3.5 text-cyan-700" />
          <span className="hidden sm:inline">Download ZIP</span>
        </a>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            disabled={clockLoading}
            onClick={() => handleQuickClock('in')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-white rounded-lg transition-all disabled:opacity-50"
            title="Clock in for today"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Clock In</span>
          </button>
          <button
            disabled={clockLoading}
            onClick={() => handleQuickClock('out')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-rose-700 hover:bg-white rounded-lg transition-all disabled:opacity-50"
            title="Clock out for today"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Clock Out</span>
          </button>
        </div>

        {clockMessage && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 animate-in fade-in">
            {clockMessage}
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
