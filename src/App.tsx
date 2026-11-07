import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LeakDetectionPage from './pages/LeakDetectionPage.tsx';
import EmployeesPage from './pages/EmployeesPage.tsx';
import DepartmentsPage from './pages/DepartmentsPage.tsx';
import AttendancePage from './pages/AttendancePage.tsx';
import LeavePage from './pages/LeavePage.tsx';
import RecordsPage from './pages/RecordsPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import AuditPage from './pages/AuditPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import { dashboardApi, leaksApi, leavesApi } from './api/client.ts';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [openLeaksCount, setOpenLeaksCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const fetchGlobalCounters = async () => {
    if (!isAuthenticated) return;
    try {
      const [statsRes, leaksRes, leavesRes] = await Promise.allSettled([
        dashboardApi.getSystemStatus(),
        leaksApi.getAll({ status: 'Detected' }),
        leavesApi.getAll({ status: 'Pending' }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setDbStatus(statsRes.value.data.status?.database);
      }
      if (leaksRes.status === 'fulfilled' && leaksRes.value.data.success) {
        const activeLeaks = leaksRes.value.data.leaks.filter(
          (l: any) => l.status !== 'Resolved' && l.status !== 'Closed'
        );
        setOpenLeaksCount(activeLeaks.length);
      }
      if (leavesRes.status === 'fulfilled' && leavesRes.value.data.success) {
        setPendingLeavesCount(leavesRes.value.data.leaves.length);
      }
    } catch (err) {
      console.error('Error fetching counters:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalCounters();
      // Periodically refresh counters
      const interval = setInterval(fetchGlobalCounters, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openLeaksCount={openLeaksCount}
        pendingLeavesCount={pendingLeavesCount}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onNavigateTab={setCurrentTab}
          openLeaksCount={openLeaksCount}
          dbStatus={dbStatus}
          onRefreshData={fetchGlobalCounters}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigateTab={setCurrentTab} onRefreshGlobal={fetchGlobalCounters} />
          )}
          {currentTab === 'leaks' && (
            <LeakDetectionPage onRefreshGlobal={fetchGlobalCounters} />
          )}
          {currentTab === 'employees' && (
            <EmployeesPage onRefreshGlobal={fetchGlobalCounters} />
          )}
          {currentTab === 'departments' && <DepartmentsPage />}
          {currentTab === 'attendance' && (
            <AttendancePage onRefreshGlobal={fetchGlobalCounters} />
          )}
          {currentTab === 'leaves' && (
            <LeavePage onRefreshGlobal={fetchGlobalCounters} />
          )}
          {currentTab === 'records' && (
            <RecordsPage onRefreshGlobal={fetchGlobalCounters} />
          )}
          {currentTab === 'reports' && <ReportsPage />}
          {currentTab === 'users' && <UsersPage />}
          {currentTab === 'audit' && <AuditPage />}
          {currentTab === 'settings' && (
            <SettingsPage onRefreshGlobal={fetchGlobalCounters} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
