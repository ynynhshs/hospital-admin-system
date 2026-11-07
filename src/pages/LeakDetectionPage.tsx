import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  ShieldAlert,
  Building,
  Activity,
  Layers,
} from 'lucide-react';
import { LeakRecord, LeakSeverity, LeakStatus, PipeSystem } from '../types/index.ts';
import { leaksApi } from '../api/client.ts';
import StatusBadge from '../components/StatusBadge.tsx';
import Modal from '../components/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface LeakDetectionPageProps {
  onRefreshGlobal?: () => void;
}

export const LeakDetectionPage: React.FC<LeakDetectionPageProps> = ({ onRefreshGlobal }) => {
  const { hasRole, user } = useAuth();
  const [leaks, setLeaks] = useState<LeakRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLeak, setSelectedLeak] = useState<LeakRecord | null>(null);

  // Form state
  const initialForm = {
    title: '',
    building: 'Main Hospital Wing A',
    floor: 'Ground Floor',
    roomWard: '',
    pipeSystem: 'Potable Water Supply' as PipeSystem,
    waterSource: '',
    severity: 'Medium' as LeakSeverity,
    status: 'Detected' as LeakStatus,
    estimatedLossPerHour: '5 Liters/hr',
    reportedBy: user?.fullName || 'Hospital Staff',
    technicianAssigned: 'David Miller',
    repairDetails: '',
    isWaterShutoffNeeded: false,
    equipmentRisk: 'None',
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchLeaks = async () => {
    try {
      setIsLoading(true);
      const res = await leaksApi.getAll({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
      });
      if (res.data.success) {
        setLeaks(res.data.leaks);
      }
    } catch (err) {
      console.error('Failed to load leaks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaks();
  }, [searchTerm, statusFilter, severityFilter]);

  const handleOpenCreate = () => {
    setFormData({
      ...initialForm,
      reportedBy: user?.fullName || 'Hospital Staff',
    });
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (leak: LeakRecord) => {
    setSelectedLeak(leak);
    setFormData({
      title: leak.title,
      building: leak.building,
      floor: leak.floor,
      roomWard: leak.roomWard,
      pipeSystem: leak.pipeSystem,
      waterSource: leak.waterSource,
      severity: leak.severity,
      status: leak.status,
      estimatedLossPerHour: leak.estimatedLossPerHour,
      reportedBy: leak.reportedBy,
      technicianAssigned: leak.technicianAssigned,
      repairDetails: leak.repairDetails || '',
      isWaterShutoffNeeded: leak.isWaterShutoffNeeded,
      equipmentRisk: leak.equipmentRisk,
      notes: leak.notes || '',
    });
    setIsEditOpen(true);
  };

  const handleOpenView = (leak: LeakRecord) => {
    setSelectedLeak(leak);
    setIsViewOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await leaksApi.create(formData);
      if (res.data.success) {
        setIsCreateOpen(false);
        fetchLeaks();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating leak record');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeak) return;
    try {
      const res = await leaksApi.update(selectedLeak._id, formData);
      if (res.data.success) {
        setIsEditOpen(false);
        fetchLeaks();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating leak record');
    }
  };

  const handleDelete = async (id: string, recordNum: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete leak incident ${recordNum}?`)) {
      return;
    }
    try {
      const res = await leaksApi.delete(id);
      if (res.data.success) {
        fetchLeaks();
        if (onRefreshGlobal) onRefreshGlobal();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting leak record');
    }
  };

  // KPI Calculations
  const criticalCount = leaks.filter((l) => l.severity === 'Critical' && l.status !== 'Closed').length;
  const activeCount = leaks.filter((l) => l.status !== 'Resolved' && l.status !== 'Closed').length;
  const shutoffCount = leaks.filter((l) => l.isWaterShutoffNeeded && l.status !== 'Closed').length;
  const resolvedCount = leaks.filter((l) => l.status === 'Resolved' || l.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Top Facility KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Active Plumbing Incidents</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{activeCount}</span>
            <span className="text-xs text-slate-500">of {leaks.length} total logged</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Critical Severity Leaks</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{criticalCount}</span>
            <span className="text-xs text-rose-500 font-medium">Requires immediate containment</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Emergency Water Shutoffs</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{shutoffCount}</span>
            <span className="text-xs text-amber-600 font-medium">Line valves isolated</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Repairs Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{resolvedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">Safe & pressure tested</span>
          </div>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplets className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hospital Plumbing & Water Leak Registry</h3>
              <p className="text-xs text-slate-500">Live monitoring of hospital chilled water, potable supply, steam & drainage</p>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Leak Incident</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, room, or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="Detected">Detected</option>
            <option value="Investigating">Investigating</option>
            <option value="Repair In Progress">Repair In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-700 font-medium"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Leaks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Record #</th>
                <th className="py-3 px-4">Incident Title & Location</th>
                <th className="py-3 px-4">Piping Circuit</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Loss / hr</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : leaks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leak incident records match current filters.
                  </td>
                </tr>
              ) : (
                leaks.map((leak) => (
                  <tr key={leak._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold font-mono text-cyan-800">
                      {leak.recordNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{leak.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {leak.building} • {leak.floor} • <span className="font-medium text-slate-700">{leak.roomWard}</span>
                      </div>
                      {leak.equipmentRisk !== 'None' && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-flex items-center gap-1 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Risk: {leak.equipmentRisk}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{leak.pipeSystem}</span>
                      <span className="block text-[11px] text-slate-400">{leak.waterSource}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={leak.severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={leak.status} />
                      {leak.isWaterShutoffNeeded && (
                        <span className="block text-[10px] font-bold text-rose-600 mt-1">Shutoff Active</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {leak.estimatedLossPerHour}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{leak.technicianAssigned}</span>
                      <span className="block text-[10px] text-slate-400">{leak.reportedDate}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(leak)}
                          title="View diagnostic details"
                          className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole('SuperAdmin', 'Admin', 'Facility Manager') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(leak)}
                              title="Update status & repair dispatch"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(leak._id, leak.recordNumber)}
                              title="Delete record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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

      {/* CREATE LEAK MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Report New Hospital Water Leak Incident"
        subtitle="Log facility plumbing breakdown, pipe breach, or chilled line condensation"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Incident Summary / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ceiling drip above dialyzer machine 4"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital Wing / Building *</label>
              <select
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              >
                <option value="Main Hospital Wing A">Main Hospital Wing A</option>
                <option value="West Tower Wing B">West Tower Wing B</option>
                <option value="Surgical Pavilion">Surgical Pavilion</option>
                <option value="Central Sterile Supply (CSSD)">Central Sterile Supply (CSSD)</option>
                <option value="Outpatient Diagnostic Annex">Outpatient Diagnostic Annex</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor Level *</label>
              <input
                type="text"
                required
                placeholder="e.g. 3rd Floor ICU"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Ward *</label>
              <input
                type="text"
                required
                placeholder="e.g. Room 304 - Dialysis Bay"
                value={formData.roomWard}
                onChange={(e) => setFormData({ ...formData, roomWard: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Piping System *</label>
              <select
                value={formData.pipeSystem}
                onChange={(e) => setFormData({ ...formData, pipeSystem: e.target.value as PipeSystem })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              >
                <option value="Potable Water Supply">Potable Water Supply</option>
                <option value="Medical Chilled Water">Medical Chilled Water</option>
                <option value="Sterilization Steam/Condensate">Sterilization Steam/Condensate</option>
                <option value="Fire Sprinkler Mains">Fire Sprinkler Mains</option>
                <option value="Drainage / Graywater">Drainage / Graywater</option>
                <option value="Roof / Rain Drain">Roof / Rain Drain</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as LeakSeverity })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              >
                <option value="Low">Low - Slow drip, contained</option>
                <option value="Medium">Medium - Steady drip / seepage</option>
                <option value="High">High - Active stream, near patient bed</option>
                <option value="Critical">Critical - Flooding or high risk to medical gear</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Loss Rate</label>
              <input
                type="text"
                placeholder="e.g. 10 Liters/hr"
                value={formData.estimatedLossPerHour}
                onChange={(e) => setFormData({ ...formData, estimatedLossPerHour: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Exact Water Source / Leak Origin *</label>
            <input
              type="text"
              required
              placeholder="e.g. Overhead copper pipe elbow behind ceiling panel #4"
              value={formData.waterSource}
              onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Technician</label>
              <input
                type="text"
                placeholder="e.g. David Miller (Lead Plumber)"
                value={formData.technicianAssigned}
                onChange={(e) => setFormData({ ...formData, technicianAssigned: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medical Equipment / Patient Risk</label>
              <input
                type="text"
                placeholder="e.g. Near dialysis machine #3, or None"
                value={formData.equipmentRisk}
                onChange={(e) => setFormData({ ...formData, equipmentRisk: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <input
              type="checkbox"
              id="shutoffNeeded"
              checked={formData.isWaterShutoffNeeded}
              onChange={(e) => setFormData({ ...formData, isWaterShutoffNeeded: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 border-slate-300"
            />
            <label htmlFor="shutoffNeeded" className="font-semibold text-slate-700 cursor-pointer">
              Immediate Main or Branch Water Shutoff Required for Safety
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Dispatch & Log Incident
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT LEAK MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Update Facility Leak Incident: ${selectedLeak?.recordNumber}`}
        subtitle="Update repair progress, reassign technician, or resolve incident"
        maxWidth="2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Transition *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeakStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800 font-semibold"
              >
                <option value="Detected">Detected - Initial alert</option>
                <option value="Investigating">Investigating - Technician assessing source</option>
                <option value="Repair In Progress">Repair In Progress - Active soldering/joint replacement</option>
                <option value="Resolved">Resolved - Plumbing repaired and pressure tested</option>
                <option value="Closed">Closed - Signed off by Facility Director</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as LeakSeverity })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Technician</label>
              <input
                type="text"
                value={formData.technicianAssigned}
                onChange={(e) => setFormData({ ...formData, technicianAssigned: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Loss Rate</label>
              <input
                type="text"
                value={formData.estimatedLossPerHour}
                onChange={(e) => setFormData({ ...formData, estimatedLossPerHour: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Repair Details & Resolution Actions</label>
            <textarea
              rows={3}
              placeholder="e.g. Isolated valve 4A. Replaced corroded compression sleeve with brass coupling. Ran 30-min hydrostatic test."
              value={formData.repairDetails}
              onChange={(e) => setFormData({ ...formData, repairDetails: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-slate-800"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <input
              type="checkbox"
              id="editShutoff"
              checked={formData.isWaterShutoffNeeded}
              onChange={(e) => setFormData({ ...formData, isWaterShutoffNeeded: e.target.checked })}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 border-slate-300"
            />
            <label htmlFor="editShutoff" className="font-semibold text-slate-700 cursor-pointer">
              Water Shutoff Valve Remains Closed
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW DIAGNOSTICS MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Leak Record: ${selectedLeak?.recordNumber}`}
        subtitle={`${selectedLeak?.building} • ${selectedLeak?.roomWard}`}
        maxWidth="lg"
      >
        {selectedLeak && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-800 mb-2">{selectedLeak.title}</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <StatusBadge status={selectedLeak.severity} />
                <StatusBadge status={selectedLeak.status} />
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                  {selectedLeak.pipeSystem}
                </span>
              </div>
              <p className="text-slate-600 font-medium">Source: {selectedLeak.waterSource}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium block">Reported By</span>
                <span className="text-slate-800 font-semibold">{selectedLeak.reportedBy}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{selectedLeak.reportedDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium block">Assigned Technician</span>
                <span className="text-slate-800 font-semibold">{selectedLeak.technicianAssigned}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium block">Estimated Loss Rate</span>
                <span className="text-slate-800 font-semibold">{selectedLeak.estimatedLossPerHour}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 font-medium block">Medical Gear Risk</span>
                <span className="text-slate-800 font-semibold">{selectedLeak.equipmentRisk}</span>
              </div>
            </div>

            {selectedLeak.repairDetails && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">Repair / Mitigation Notes</span>
                <p className="text-emerald-950 font-medium">{selectedLeak.repairDetails}</p>
                {selectedLeak.resolvedDate && (
                  <span className="text-[10px] text-emerald-700 mt-1 block">Resolved on: {selectedLeak.resolvedDate}</span>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Close Diagnostic View
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeakDetectionPage;
