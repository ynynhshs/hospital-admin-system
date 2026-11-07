import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, Key, RefreshCw, Server, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { dashboardApi, authApi } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface SettingsPageProps {
  onRefreshGlobal?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefreshGlobal }) => {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; success: boolean } | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await dashboardApi.getSystemStatus();
      if (res.data.success) {
        setDbStatus(res.data.status);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm('Reset and re-seed the hospital database with clean baseline demo records?')) {
      return;
    }
    try {
      setSeedLoading(true);
      const res = await dashboardApi.seedDatabase();
      if (res.data.success) {
        setSeedSuccess('Hospital database successfully re-seeded with standard records.');
        fetchStatus();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error executing database seed');
    } finally {
      setSeedLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        setPasswordMsg({ text: 'Password updated successfully.', success: true });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password.',
        success: false,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Database Connection Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">MongoDB Database Configuration</h3>
              <p className="text-xs text-slate-500">Mongoose ODM integration & persistent database storage</p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh database connectivity"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Connection State
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus?.database?.isConnected ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}
              />
              <span className="font-bold text-slate-800 text-sm">
                {dbStatus?.database?.mode || 'Active Storage'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {dbStatus?.database?.isConnected
                ? 'Directly connected to remote MongoDB Atlas cluster.'
                : 'Using local resilient persistent store with real Mongoose model contracts. Add MONGODB_URI in .env to point to your live Atlas cluster.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Record Counts
            </span>
            <div className="space-y-1 text-slate-700 font-medium">
              <div>Employees: <span className="font-bold text-slate-900">{dbStatus?.counts?.employees || 0}</span></div>
              <div>Water Leaks Logged: <span className="font-bold text-slate-900">{dbStatus?.counts?.leakRecords || 0}</span></div>
              <div>User Accounts: <span className="font-bold text-slate-900">{dbStatus?.counts?.users || 0}</span></div>
            </div>
          </div>
        </div>

        {/* Database Seed Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">Re-Initialize Seed Records</span>
            <span className="text-slate-500">
              Restore standard clinical personnel, plumbing incidents, departments, and attendance logs.
            </span>
          </div>
          <button
            onClick={handleSeed}
            disabled={seedLoading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seedLoading ? 'animate-spin' : ''}`} />
            <span>Seed Database</span>
          </button>
        </div>

        {seedSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{seedSuccess}</span>
          </div>
        )}
      </div>

      {/* Source Code ZIP Download Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Project Source Code Archive</h3>
              <p className="text-xs text-slate-500">Download complete standalone codebase (.zip) with Express backend & React frontend</p>
            </div>
          </div>
          <a
            href="/api/system/download-zip"
            download="hospital-admin-system.zip"
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download hospital-admin-system.zip</span>
          </a>
        </div>
      </div>

      {/* Account Security & Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Account Credentials & Password</h3>
            <p className="text-xs text-slate-500">Change your login password for {user?.username} ({user?.role})</p>
          </div>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              passwordMsg.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {passwordMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
          >
            Update Account Password
          </button>
        </form>
      </div>

      {/* Security Compliance Info */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0" />
        <div>
          <span className="font-bold text-slate-800 block">Hospital IT Architecture Compliance</span>
          <span>
            Operating with Node.js/Express REST backend, Bcrypt-hashed credentials, JWT Bearer tokens, and Mongoose Atlas schemas.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
