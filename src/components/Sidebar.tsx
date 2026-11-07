import React from 'react';
import {
  LayoutDashboard,
  Droplets,
  Users,
  Building2,
  Clock,
  CalendarDays,
  FileCheck2,
  FileSpreadsheet,
  ShieldAlert,
  History,
  Settings,
  LogOut,
  Hospital,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openLeaksCount?: number;
  pendingLeavesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openLeaksCount = 0,
  pendingLeavesCount = 0,
}) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager', 'Staff'],
    },
    {
      id: 'leaks',
      label: 'Leak Detection',
      icon: Droplets,
      badge: openLeaksCount > 0 ? openLeaksCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      roles: ['SuperAdmin', 'Admin', 'Facility Manager', 'HR Manager', 'Staff'],
    },
    {
      id: 'employees',
      label: 'HR & Employees',
      icon: Users,
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager', 'Staff'],
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager'],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Clock,
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager', 'Staff'],
    },
    {
      id: 'leaves',
      label: 'Leave Management',
      icon: CalendarDays,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager', 'Staff'],
    },
    {
      id: 'records',
      label: 'Employee Records',
      icon: FileCheck2,
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Staff'],
    },
    {
      id: 'reports',
      label: 'Reports Generator',
      icon: FileSpreadsheet,
      roles: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager'],
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: ShieldAlert,
      roles: ['SuperAdmin', 'Admin', 'HR Manager'],
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      roles: ['SuperAdmin', 'Admin', 'HR Manager'],
    },
    {
      id: 'settings',
      label: 'Database & Settings',
      icon: Settings,
      roles: ['SuperAdmin', 'Admin'],
    },
  ];

  return (
    <aside className="w-68 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
          <Hospital className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            MedAdmin <span className="text-cyan-400 text-xs px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">PRO</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Hospital HR & Facilities</p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Hospital Operations
        </div>
        {navItems.map((item) => {
          const isAllowed = !item.roles || item.roles.some((r) => hasRole(r as any));
          if (!isAllowed) return null;

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <div className="p-2 rounded-xl bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-700/60 border border-cyan-600/40 flex items-center justify-center text-xs font-bold text-cyan-200">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-cyan-400 font-medium truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
