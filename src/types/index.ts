export type UserRole = 'SuperAdmin' | 'Admin' | 'HR Manager' | 'Facility Manager' | 'Staff';
export type UserStatus = 'Active' | 'Suspended' | 'Inactive';

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  phone?: string;
  status: UserStatus;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  dateOfJoining: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  shift: string;
  salary: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address?: string;
  bloodGroup?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  floor: string;
  budget: number;
  extension: string;
  activeEmployeesCount: number;
  createdAt: string;
}

export type LeakSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type LeakStatus = 'Detected' | 'Investigating' | 'Repair In Progress' | 'Resolved' | 'Closed';
export type PipeSystem =
  | 'Potable Water Supply'
  | 'Medical Chilled Water'
  | 'Sterilization Steam/Condensate'
  | 'Fire Sprinkler Mains'
  | 'Drainage / Graywater'
  | 'Roof / Rain Drain';

export interface LeakRecord {
  _id: string;
  recordNumber: string;
  title: string;
  building: string;
  floor: string;
  roomWard: string;
  pipeSystem: PipeSystem;
  waterSource: string;
  severity: LeakSeverity;
  status: LeakStatus;
  estimatedLossPerHour: string;
  reportedBy: string;
  reportedDate: string;
  technicianAssigned: string;
  repairDetails?: string;
  resolvedDate?: string;
  isWaterShutoffNeeded: boolean;
  equipmentRisk: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';

export interface Attendance {
  _id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: AttendanceStatus;
  workHours: number;
  overtimeHours: number;
  shift: string;
  remarks?: string;
  markedBy: string;
  createdAt: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Emergency' | 'Casual' | 'Study / Conference';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Leave {
  _id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewRemarks?: string;
  createdAt: string;
}

export type DocumentType =
  | 'Medical License'
  | 'BLS/ACLS Certification'
  | 'DEA Registration'
  | 'Employment Contract'
  | 'Background Check'
  | 'Vaccination Record'
  | 'Academic Degree'
  | 'National ID / Passport';

export type VerificationStatus = 'Verified' | 'Pending Verification' | 'Expired' | 'Rejected';

export interface EmployeeRecord {
  _id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  documentType: DocumentType;
  documentTitle: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  verificationStatus: VerificationStatus;
  notes?: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'APPROVE' | 'REJECT' | 'EXPORT';
  module:
    | 'Auth'
    | 'Users'
    | 'Employees'
    | 'Departments'
    | 'Leak Detection'
    | 'Attendance'
    | 'Leave'
    | 'Documents'
    | 'Reports'
    | 'System';
  details: string;
  ipAddress: string;
}

export interface DashboardData {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
    openLeaks: number;
    criticalLeaks: number;
    pendingLeaves: number;
    todayAttendance: {
      present: number;
      late: number;
      totalMarked: number;
      rate: number;
    };
    complianceDocs: {
      total: number;
      verified: number;
      pending: number;
    };
  };
  departmentDistribution: {
    name: string;
    code: string;
    count: number;
    budget: number;
  }[];
  recentLeaks: LeakRecord[];
  pendingLeavesList: Leave[];
  recentActivity: AuditLog[];
  database: {
    isConnected: boolean;
    mode: string;
    uriConfigured: boolean;
    error: string | null;
  };
}
