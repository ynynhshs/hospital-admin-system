import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Building2,
  Calendar,
  CheckCircle2,
  Hospital,
  RefreshCw,
} from 'lucide-react';
import { reportsApi, departmentsApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('employees');
  const [department, setDepartment] = useState('');
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const fetchDepartments = async () => {
    try {
      const res = await departmentsApi.getAll();
      if (res.data.success) {
        setDepartmentsList(res.data.departments.map((d: any) => d.name));
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      const res = await reportsApi.generate({
        type: reportType,
        department: department || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.data.success) {
        setReportData(res.data.report);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    handleGenerateReport();
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;

    const headers = reportData.headers;
    const rows = reportData.data.map((row: any) =>
      headers
        .map((h: string) => {
          let val = row[h] !== undefined ? String(row[h]) : '';
          // Escape quotes
          val = val.replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    );

    const csvContent = [headers.map((h: string) => `"${h}"`).join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hospital_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Filter Controls (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hospital Administration Reports & Analytics</h3>
              <p className="text-xs text-slate-500">Generate printable audit reports, timesheet census & facility incident logs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isLoading || !reportData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Export</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={isLoading || !reportData}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Report Subject</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
            >
              <option value="employees">Staff & Human Resources Census</option>
              <option value="attendance">Timesheets & Shift Attendance</option>
              <option value="leave">Leave Utilization & Absences</option>
              <option value="leaks">Facility Water Leaks & Maintenance</option>
              <option value="compliance">Licensure & Credential Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
            >
              <option value="">All Hospital Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status Filter</label>
            <input
              type="text"
              placeholder="e.g. Active, Critical, Approved"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="w-full py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Sheet Document */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 print:p-0 print:border-none print:shadow-none">
        {/* Hospital Print Letterhead */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Hospital className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MedAdmin Health System</h1>
              <p className="text-xs text-slate-500">General Hospital Administration, HR, and Facility Compliance Directorate</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800">{reportData?.title}</p>
            <p className="text-[11px] mt-0.5">Generated: {reportData?.generatedAt}</p>
            <p className="text-[11px]">Officer: {reportData?.generatedBy}</p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        {reportData?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.entries(reportData.summary).map(([key, val]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-lg font-bold text-slate-800">{String(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                {reportData?.headers?.map((h: string) => (
                  <th key={h} className="py-2.5 px-3 border-r border-slate-200 last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={reportData?.headers?.length || 5} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : reportData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={reportData?.headers?.length || 5} className="py-12 text-center text-slate-400">
                    No matching records found for this reporting period.
                  </td>
                </tr>
              ) : (
                reportData?.data?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {reportData.headers.map((h: string) => (
                      <td key={h} className="py-2.5 px-3 border-r border-slate-200 last:border-r-0 text-slate-700">
                        {h.toLowerCase().includes('status') || h.toLowerCase().includes('severity') ? (
                          <StatusBadge status={row[h]} dot={false} />
                        ) : (
                          row[h]
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Print Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>Official Hospital Administration Electronic Record • Confidential & Protected Health Information</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
