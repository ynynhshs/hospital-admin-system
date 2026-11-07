import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck, User, Terminal, Laptop } from 'lucide-react';
import { AuditLog } from '../types/index.ts';
import { auditApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await auditApi.getAll({
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        userName: userSearch || undefined,
      });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter, userSearch]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <History className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Hospital Security & Activity Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable record of logins, medical document edits, leak logs, and leave reviews</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by staff user name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="">All Hospital Modules</option>
            <option value="Auth">Auth & Logins</option>
            <option value="Users">Users Management</option>
            <option value="Employees">Employees / HR</option>
            <option value="Departments">Departments</option>
            <option value="Leak Detection">Leak Detection</option>
            <option value="Attendance">Attendance</option>
            <option value="Leave">Leave Approvals</option>
            <option value="Documents">Employee Documents</option>
            <option value="Reports">Reports Generated</option>
            <option value="System">System & Database</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="">All Action Types</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="EXPORT">EXPORT</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / Staff</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Audit Details & Event Description</th>
                <th className="py-3 px-4 text-right">Terminal IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit log entries matching current criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({log.userRole})</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.action} dot={false} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditPage;
