import React, { useState } from 'react';
import { Hospital, ShieldCheck, Lock, User, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@hospital.org');
  const [password, setPassword] = useState('Admin123!Secure');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(identifier, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const selectTestAccount = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-8 text-white text-center relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-cyan-950/50">
            <Hospital className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">MedAdmin Pro</h2>
          <p className="text-cyan-300 text-xs mt-1 font-medium tracking-wide">
            Hospital Administration, HR & Facilities Portal
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Email or Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@hospital.org"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white text-slate-800 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Hospital Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Role Switcher Demo */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
              Instant Demo Access by Role
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectTestAccount('admin@hospital.org', 'Admin123!Secure')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-cyan-700">SuperAdmin</div>
                <div className="text-[10px] text-slate-500">Dr. Eleanor Vance</div>
              </button>

              <button
                type="button"
                onClick={() => selectTestAccount('hrmanager@hospital.org', 'HrManager123!')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-cyan-700">HR Manager</div>
                <div className="text-[10px] text-slate-500">Marcus Sterling</div>
              </button>

              <button
                type="button"
                onClick={() => selectTestAccount('facility@hospital.org', 'Facility123!')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-cyan-700">Facility Manager</div>
                <div className="text-[10px] text-slate-500">Arthur Pendelton</div>
              </button>

              <button
                type="button"
                onClick={() => selectTestAccount('nurse@hospital.org', 'Staff123!')}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all cursor-pointer text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-cyan-700">Medical Staff (RN)</div>
                <div className="text-[10px] text-slate-500">Sarah Jenkins, RN</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-slate-500 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span>Enterprise Healthcare Security • HIPAA Compliant Mongoose Data Layer</span>
      </div>
    </div>
  );
};

export default LoginPage;
