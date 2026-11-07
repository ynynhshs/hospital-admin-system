import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { logUserAction } from '../middleware/auditLogger.ts';

export const generateReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, department, status, startDate, endDate } = req.query;
    const reportType = (type as string) || 'employees';

    let title = '';
    let summary: any = {};
    let data: any[] = [];
    let headers: string[] = [];

    const now = new Date();
    const generatedAt = now.toLocaleString();
    const generatedBy = req.user?.fullName || 'Hospital Administrator';

    if (reportType === 'employees') {
      title = 'Hospital Staff & Human Resources Census Report';
      const allEmps = await storage.getEmployees({
        department: department as string,
        status: status as string,
      });

      headers = ['Employee ID', 'Full Name', 'Department', 'Position', 'Type', 'Status', 'Shift', 'Date of Joining'];
      data = allEmps.map((e) => ({
        'Employee ID': e.employeeId,
        'Full Name': `${e.firstName} ${e.lastName}`,
        'Department': e.department,
        'Position': e.position,
        'Type': e.employmentType,
        'Status': e.status,
        'Shift': e.shift,
        'Date of Joining': e.dateOfJoining,
        'Email': e.email,
        'Phone': e.phone,
      }));

      const active = allEmps.filter((e) => e.status === 'Active').length;
      const onLeave = allEmps.filter((e) => e.status === 'On Leave').length;
      summary = {
        totalEmployees: allEmps.length,
        activeStaff: active,
        onLeaveStaff: onLeave,
        departmentsCovered: Array.from(new Set(allEmps.map((e) => e.department))).length,
      };
    } else if (reportType === 'attendance') {
      title = 'Hospital Staff Attendance & Timesheet Report';
      const records = await storage.getAttendance({
        department: department as string,
        status: status as string,
      });

      headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Time In', 'Time Out', 'Hours', 'Overtime'];
      data = records.map((a) => ({
        'Date': a.date,
        'Employee ID': a.employeeCode,
        'Employee Name': a.employeeName,
        'Department': a.department,
        'Status': a.status,
        'Time In': a.timeIn || '--',
        'Time Out': a.timeOut || '--',
        'Hours': a.workHours || 8,
        'Overtime': a.overtimeHours || 0,
      }));

      const present = records.filter((r) => r.status === 'Present').length;
      const late = records.filter((r) => r.status === 'Late').length;
      const totalOvertime = records.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);

      summary = {
        totalRecords: records.length,
        presentCount: present,
        lateCount: late,
        attendanceRate: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
        totalOvertimeHours: totalOvertime,
      };
    } else if (reportType === 'leave') {
      title = 'Employee Leave Utilization & Absences Report';
      const leaves = await storage.getLeaves({
        department: department as string,
        status: status as string,
      });

      headers = ['Employee ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reviewed By'];
      data = leaves.map((l) => ({
        'Employee ID': l.employeeCode,
        'Employee Name': l.employeeName,
        'Department': l.department,
        'Leave Type': l.leaveType,
        'Start Date': l.startDate,
        'End Date': l.endDate,
        'Days': l.daysCount,
        'Status': l.status,
        'Reason': l.reason,
        'Reviewed By': l.reviewedBy || 'Pending',
      }));

      const approved = leaves.filter((l) => l.status === 'Approved').length;
      const pending = leaves.filter((l) => l.status === 'Pending').length;
      const totalDays = leaves.filter((l) => l.status === 'Approved').reduce((acc, l) => acc + l.daysCount, 0);

      summary = {
        totalApplications: leaves.length,
        approvedLeaves: approved,
        pendingLeaves: pending,
        totalApprovedDays: totalDays,
      };
    } else if (reportType === 'leaks') {
      title = 'Facility Plumbing & Water Leak Incident Monitoring Report';
      const leaks = await storage.getLeakRecords({
        status: status as string,
      });

      headers = ['Record #', 'Location / Ward', 'System', 'Severity', 'Status', 'Loss / hr', 'Technician', 'Reported Date'];
      data = leaks.map((l) => ({
        'Record #': l.recordNumber,
        'Title': l.title,
        'Building': l.building,
        'Location / Ward': l.roomWard,
        'System': l.pipeSystem,
        'Severity': l.severity,
        'Status': l.status,
        'Loss / hr': l.estimatedLossPerHour,
        'Technician': l.technicianAssigned,
        'Reported Date': l.reportedDate,
      }));

      const critical = leaks.filter((l) => l.severity === 'Critical').length;
      const resolved = leaks.filter((l) => l.status === 'Resolved' || l.status === 'Closed').length;
      const open = leaks.length - resolved;

      summary = {
        totalIncidents: leaks.length,
        activeOpenLeaks: open,
        criticalIncidents: critical,
        resolvedRepairs: resolved,
        shutoffsRequired: leaks.filter((l) => l.isWaterShutoffNeeded).length,
      };
    } else if (reportType === 'compliance') {
      title = 'Employee Credentials & Medical Licensure Compliance Report';
      const records = await storage.getEmployeeRecords();

      headers = ['Employee ID', 'Employee Name', 'Credential Type', 'Document Title', 'Status', 'Expiry Date', 'Verified By'];
      data = records.map((r) => ({
        'Employee ID': r.employeeCode,
        'Employee Name': r.employeeName,
        'Credential Type': r.documentType,
        'Document Title': r.documentTitle,
        'Status': r.verificationStatus,
        'Expiry Date': r.expiryDate || 'N/A',
        'Verified By': r.uploadedBy,
      }));

      const verified = records.filter((r) => r.verificationStatus === 'Verified').length;
      const pending = records.filter((r) => r.verificationStatus === 'Pending Verification').length;

      summary = {
        totalCredentialsTracked: records.length,
        verifiedCredentials: verified,
        pendingVerification: pending,
        complianceRate: records.length > 0 ? Math.round((verified / records.length) * 100) : 0,
      };
    }

    await logUserAction(req, 'EXPORT', 'Reports', `Generated ${title} (${reportType})`);

    return res.status(200).json({
      success: true,
      report: {
        type: reportType,
        title,
        generatedAt,
        generatedBy,
        summary,
        headers,
        data,
      },
    });
  } catch (err: any) {
    console.error('Error generating report:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
};
