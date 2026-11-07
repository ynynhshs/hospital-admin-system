import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel, IUser } from './models/User.ts';
import { EmployeeModel, IEmployee } from './models/Employee.ts';
import { DepartmentModel, IDepartment } from './models/Department.ts';
import { LeakRecordModel, ILeakRecord } from './models/LeakRecord.ts';
import { AttendanceModel, IAttendance } from './models/Attendance.ts';
import { LeaveModel, ILeave } from './models/Leave.ts';
import { EmployeeRecordModel, IEmployeeRecord } from './models/EmployeeRecord.ts';
import { AuditLogModel, IAuditLog } from './models/AuditLog.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hospital_db.json');

interface DatabaseStore {
  users: any[];
  employees: any[];
  departments: any[];
  leakRecords: any[];
  attendance: any[];
  leaves: any[];
  records: any[];
  auditLogs: any[];
}

// Generate random UUID-like ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

class StorageManager {
  private inMemoryData: DatabaseStore = {
    users: [],
    employees: [],
    departments: [],
    leakRecords: [],
    attendance: [],
    leaves: [],
    records: [],
    auditLogs: [],
  };

  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.inMemoryData = JSON.parse(fileContent);
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.warn('⚠️  Could not read local DB file, initializing fresh store in memory:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.inMemoryData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  public isMongooseActive(): boolean {
    return mongoose.connection.readyState === 1;
  }

  // --- Seed Data Initialization ---
  public seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPassHash = bcrypt.hashSync('Admin123!Secure', salt);
    const hrPassHash = bcrypt.hashSync('HrManager123!', salt);
    const facilityPassHash = bcrypt.hashSync('Facility123!', salt);
    const staffPassHash = bcrypt.hashSync('Staff123!', salt);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    this.inMemoryData.users = [
      {
        _id: 'usr_superadmin_01',
        username: 'admin',
        email: 'admin@hospital.org',
        password: adminPassHash,
        fullName: 'Dr. Eleanor Vance',
        role: 'SuperAdmin',
        department: 'General Administration',
        phone: '+1 (555) 019-2831',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        _id: 'usr_hr_01',
        username: 'hrmanager',
        email: 'hrmanager@hospital.org',
        password: hrPassHash,
        fullName: 'Marcus Sterling',
        role: 'HR Manager',
        department: 'Human Resources',
        phone: '+1 (555) 019-4455',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        _id: 'usr_facil_01',
        username: 'facilitymgr',
        email: 'facility@hospital.org',
        password: facilityPassHash,
        fullName: 'Arthur Pendelton',
        role: 'Facility Manager',
        department: 'Facilities & Maintenance',
        phone: '+1 (555) 019-7788',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date('2024-02-20').toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        _id: 'usr_staff_01',
        username: 'sarahnurse',
        email: 'nurse@hospital.org',
        password: staffPassHash,
        fullName: 'Sarah Jenkins, RN',
        role: 'Staff',
        department: 'Emergency Medicine',
        phone: '+1 (555) 019-9912',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1594824813576-90f7a77e923e?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    this.inMemoryData.departments = [
      {
        _id: 'dept_01',
        name: 'Emergency Medicine',
        code: 'EMERG',
        description: '24/7 Level 1 Trauma, Resuscitation and Urgent Care Department',
        headOfDepartment: 'Dr. Gregory Thorne',
        floor: 'Ground Floor, North Wing',
        budget: 1200000,
        extension: '101',
        activeEmployeesCount: 28,
        createdAt: now.toISOString(),
      },
      {
        _id: 'dept_02',
        name: 'Surgical Services & OR',
        code: 'SURG',
        description: 'General, Orthopedic, Neuro and Cardiothoracic Operating Suites',
        headOfDepartment: 'Dr. Evelyn Martinez',
        floor: '2nd Floor, Surgical Pavilion',
        budget: 2500000,
        extension: '201',
        activeEmployeesCount: 35,
        createdAt: now.toISOString(),
      },
      {
        _id: 'dept_03',
        name: 'Facilities & Maintenance',
        code: 'FACIL',
        description: 'Hospital Infrastructure, HVAC, Medical Gas, Plumbing and Water Systems',
        headOfDepartment: 'Arthur Pendelton',
        floor: 'Basement Level B1 & B2',
        budget: 650000,
        extension: '900',
        activeEmployeesCount: 16,
        createdAt: now.toISOString(),
      },
      {
        _id: 'dept_04',
        name: 'Cardiology & Catheterization',
        code: 'CARD',
        description: 'Interventional Cardiology, CCU, and Diagnostic Echocardiography',
        headOfDepartment: 'Dr. Aris Thorne',
        floor: '3rd Floor, West Tower',
        budget: 1800000,
        extension: '305',
        activeEmployeesCount: 22,
        createdAt: now.toISOString(),
      },
      {
        _id: 'dept_05',
        name: 'Intensive Care Unit (ICU)',
        code: 'ICU',
        description: 'Critical Care, Mechanical Ventilation, and Post-Op Monitoring',
        headOfDepartment: 'Dr. Alistair Chen',
        floor: '4th Floor, Central Wing',
        budget: 1950000,
        extension: '401',
        activeEmployeesCount: 24,
        createdAt: now.toISOString(),
      },
      {
        _id: 'dept_06',
        name: 'Human Resources',
        code: 'HR',
        description: 'Talent Acquisition, Credentialing, Payroll, and Hospital Administration',
        headOfDepartment: 'Marcus Sterling',
        floor: 'Administration Annex, 1st Floor',
        budget: 420000,
        extension: '110',
        activeEmployeesCount: 8,
        createdAt: now.toISOString(),
      },
    ];

    this.inMemoryData.employees = [
      {
        _id: 'emp_01',
        employeeId: 'EMP-1001',
        firstName: 'Eleanor',
        lastName: 'Vance',
        email: 'admin@hospital.org',
        phone: '+1 (555) 019-2831',
        department: 'General Administration',
        position: 'Chief Hospital Administrator',
        role: 'Chief Medical Officer',
        employmentType: 'Full-Time',
        dateOfJoining: '2018-04-12',
        status: 'Active',
        shift: 'Day Shift (08:00 - 17:00)',
        salary: 210000,
        emergencyContact: {
          name: 'Robert Vance',
          relationship: 'Spouse',
          phone: '+1 (555) 019-2832',
        },
        address: '450 Oakmont Blvd, Metro City',
        bloodGroup: 'A+',
        notes: 'Board Certified in Healthcare Administration and Internal Medicine.',
        createdAt: now.toISOString(),
      },
      {
        _id: 'emp_02',
        employeeId: 'EMP-1002',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'nurse@hospital.org',
        phone: '+1 (555) 019-9912',
        department: 'Emergency Medicine',
        position: 'Lead Triage Nurse (BSN, RN)',
        role: 'Charge Nurse',
        employmentType: 'Full-Time',
        dateOfJoining: '2021-08-15',
        status: 'Active',
        shift: 'Morning (07:00 - 15:00)',
        salary: 86000,
        emergencyContact: {
          name: 'Clara Jenkins',
          relationship: 'Mother',
          phone: '+1 (555) 019-9913',
        },
        address: '112 Riverdale Ave, Apt 4B',
        bloodGroup: 'O+',
        notes: 'TNCC and ACLS Certified. Disaster response lead.',
        createdAt: now.toISOString(),
      },
      {
        _id: 'emp_03',
        employeeId: 'EMP-1003',
        firstName: 'Arthur',
        lastName: 'Pendelton',
        email: 'facility@hospital.org',
        phone: '+1 (555) 019-7788',
        department: 'Facilities & Maintenance',
        position: 'Director of Plant Operations',
        role: 'Facility Engineer',
        employmentType: 'Full-Time',
        dateOfJoining: '2019-01-20',
        status: 'Active',
        shift: 'Day Shift (08:00 - 17:00)',
        salary: 95000,
        emergencyContact: {
          name: 'Judith Pendelton',
          relationship: 'Spouse',
          phone: '+1 (555) 019-7789',
        },
        address: '89 Willow Creek Lane',
        bloodGroup: 'B+',
        notes: 'Licensed Master Plumber & Certified Healthcare Facility Manager (CHFM).',
        createdAt: now.toISOString(),
      },
      {
        _id: 'emp_04',
        employeeId: 'EMP-1004',
        firstName: 'Marcus',
        lastName: 'Sterling',
        email: 'hrmanager@hospital.org',
        phone: '+1 (555) 019-4455',
        department: 'Human Resources',
        position: 'Senior HR Manager & Compliance Officer',
        role: 'HR Director',
        employmentType: 'Full-Time',
        dateOfJoining: '2020-03-10',
        status: 'Active',
        shift: 'Day Shift (08:30 - 17:30)',
        salary: 105000,
        emergencyContact: {
          name: 'Lillian Sterling',
          relationship: 'Spouse',
          phone: '+1 (555) 019-4456',
        },
        address: '742 Highland Terrace',
        bloodGroup: 'AB+',
        notes: 'SHRM-SCP certified, oversees clinical credentialing & audit compliance.',
        createdAt: now.toISOString(),
      },
      {
        _id: 'emp_05',
        employeeId: 'EMP-1005',
        firstName: 'Evelyn',
        lastName: 'Martinez',
        email: 'evelyn.martinez@hospital.org',
        phone: '+1 (555) 019-3321',
        department: 'Surgical Services & OR',
        position: 'Attending General & Laparoscopic Surgeon',
        role: 'Chief of Surgery',
        employmentType: 'Full-Time',
        dateOfJoining: '2017-09-01',
        status: 'Active',
        shift: 'Rotating',
        salary: 320000,
        emergencyContact: {
          name: 'Carlos Martinez',
          relationship: 'Brother',
          phone: '+1 (555) 019-3322',
        },
        address: '302 Beacon Hill Rd',
        bloodGroup: 'O-',
        notes: 'FACS certified. Robotic surgery lead specialist.',
        createdAt: now.toISOString(),
      },
      {
        _id: 'emp_06',
        employeeId: 'EMP-1006',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@hospital.org',
        phone: '+1 (555) 019-6611',
        department: 'Facilities & Maintenance',
        position: 'Senior Mechanical & Plumbing Technician',
        role: 'Facility Lead',
        employmentType: 'Full-Time',
        dateOfJoining: '2022-05-18',
        status: 'Active',
        shift: 'Morning (07:00 - 15:00)',
        salary: 68000,
        emergencyContact: {
          name: 'Lisa Miller',
          relationship: 'Spouse',
          phone: '+1 (555) 019-6612',
        },
        address: '15 Maple Grove Court',
        bloodGroup: 'A-',
        notes: 'Lead responder for plumbing, chilled water piping, and leak mitigation.',
        createdAt: now.toISOString(),
      },
    ];

    this.inMemoryData.leakRecords = [
      {
        _id: 'leak_01',
        recordNumber: 'WLK-2026-001',
        title: 'Ceiling Water Drip above Dialysis Station 4',
        building: 'Main Hospital Wing A',
        floor: '3rd Floor ICU / Nephrology',
        roomWard: 'Room 304 - Dialysis Bay',
        pipeSystem: 'Potable Water Supply',
        waterSource: 'Overhead copper valve coupling behind acoustic ceiling tile',
        severity: 'High',
        status: 'Repair In Progress',
        estimatedLossPerHour: '12 Liters/hr',
        reportedBy: 'Sarah Jenkins, RN',
        reportedDate: `${todayStr} 08:30`,
        technicianAssigned: 'David Miller (Plumbing Specialist)',
        repairDetails: 'Isolated supply line valve #3B. Replacing 3/4" compression elbow with sweat joint. Containment tarp installed.',
        isWaterShutoffNeeded: true,
        equipmentRisk: 'Hemodialysis machine #3 isolated and moved 6 feet away. No patient impact.',
        notes: 'Urgent priority due to proximity to dialysis stations.',
        createdAt: now.toISOString(),
      },
      {
        _id: 'leak_02',
        recordNumber: 'WLK-2026-002',
        title: 'Chilled Water Line Condensation Leak in MRI Prep',
        building: 'West Tower Wing B',
        floor: 'Ground Floor',
        roomWard: 'Radiology Suite - MRI Chiller Room B-12',
        pipeSystem: 'Medical Chilled Water',
        waterSource: 'Armaflex insulation seam tear on 4" primary chilled line',
        severity: 'Critical',
        status: 'Investigating',
        estimatedLossPerHour: '25 Liters/hr',
        reportedBy: 'Arthur Pendelton',
        reportedDate: `${todayStr} 10:15`,
        technicianAssigned: 'David Miller',
        repairDetails: 'Secondary sump pump engaged. Insulation specialist summoned for vapor barrier reinsulation.',
        isWaterShutoffNeeded: false,
        equipmentRisk: 'Proximity to Siemens 3T MRI superconducting magnet heat exchanger.',
        notes: 'Chiller remains operational to maintain helium compressor chilling.',
        createdAt: now.toISOString(),
      },
      {
        _id: 'leak_03',
        recordNumber: 'WLK-2026-003',
        title: 'Surgical Scrub Sink Drain Trap Leakage',
        building: 'Surgical Pavilion',
        floor: '2nd Floor OR Block',
        roomWard: 'OR Suite 4 Ante-Room Washbay',
        pipeSystem: 'Drainage / Graywater',
        waterSource: 'Loose slip nut and degraded washer on stainless P-trap',
        severity: 'Low',
        status: 'Resolved',
        estimatedLossPerHour: '2 Liters/hr',
        reportedBy: 'Dr. Evelyn Martinez',
        reportedDate: '2026-11-04 14:20',
        technicianAssigned: 'David Miller',
        repairDetails: 'Disassembled P-trap, cleaned calcium scale, installed new heavy-duty silicone rubber gasket. Pressure tested for 20 minutes.',
        resolvedDate: '2026-11-04 16:45',
        isWaterShutoffNeeded: false,
        equipmentRisk: 'None. Contained in stainless catchment tray.',
        notes: 'Repaired same-day without surgical schedule disruption.',
        createdAt: new Date('2026-11-04').toISOString(),
      },
      {
        _id: 'leak_04',
        recordNumber: 'WLK-2026-004',
        title: 'Steam Autoclave Condensate Return Flange Weep',
        building: 'Central Sterile Supply (CSSD)',
        floor: 'Basement Level B1',
        roomWard: 'Decontamination Bay #2',
        pipeSystem: 'Sterilization Steam/Condensate',
        waterSource: 'High pressure steam condensate return gasket',
        severity: 'Medium',
        status: 'Detected',
        estimatedLossPerHour: '4 Liters/hr (Superheated)',
        reportedBy: 'Marcus Sterling',
        reportedDate: `${todayStr} 07:45`,
        technicianAssigned: 'Arthur Pendelton',
        repairDetails: 'Awaiting scheduled 19:00 autoclave shutdown cycle to de-energize steam line and torque flange bolts.',
        isWaterShutoffNeeded: false,
        equipmentRisk: 'Sterilization cycles 1-4 completed. Area cordoned off with thermal warning signs.',
        notes: 'Scheduled for tonight after decontamination shifts finish.',
        createdAt: now.toISOString(),
      },
    ];

    this.inMemoryData.attendance = [
      {
        _id: 'att_01',
        employeeId: 'emp_01',
        employeeCode: 'EMP-1001',
        employeeName: 'Eleanor Vance',
        department: 'General Administration',
        date: todayStr,
        timeIn: '07:45 AM',
        timeOut: '',
        status: 'Present',
        workHours: 8,
        overtimeHours: 0,
        shift: 'Day Shift (08:00 - 17:00)',
        remarks: 'On-site for morning executive medical board meeting.',
        markedBy: 'Biometric Scanner #1',
        createdAt: now.toISOString(),
      },
      {
        _id: 'att_02',
        employeeId: 'emp_02',
        employeeCode: 'EMP-1002',
        employeeName: 'Sarah Jenkins',
        department: 'Emergency Medicine',
        date: todayStr,
        timeIn: '06:48 AM',
        timeOut: '',
        status: 'Present',
        workHours: 8,
        overtimeHours: 1.5,
        shift: 'Morning (07:00 - 15:00)',
        remarks: 'Triage shift coverage for trauma influx.',
        markedBy: 'Biometric Scanner #3',
        createdAt: now.toISOString(),
      },
      {
        _id: 'att_03',
        employeeId: 'emp_03',
        employeeCode: 'EMP-1003',
        employeeName: 'Arthur Pendelton',
        department: 'Facilities & Maintenance',
        date: todayStr,
        timeIn: '07:15 AM',
        timeOut: '',
        status: 'Present',
        workHours: 8,
        overtimeHours: 0,
        shift: 'Day Shift (08:00 - 17:00)',
        remarks: 'Facility inspection in West Wing.',
        markedBy: 'Biometric Scanner #4',
        createdAt: now.toISOString(),
      },
      {
        _id: 'att_04',
        employeeId: 'emp_05',
        employeeCode: 'EMP-1005',
        employeeName: 'Evelyn Martinez',
        department: 'Surgical Services & OR',
        date: todayStr,
        timeIn: '06:30 AM',
        timeOut: '',
        status: 'Present',
        workHours: 9,
        overtimeHours: 2,
        shift: 'Rotating',
        remarks: 'OR Suite 1 Emergency Cholecystectomy.',
        markedBy: 'OR Terminal #2',
        createdAt: now.toISOString(),
      },
      {
        _id: 'att_05',
        employeeId: 'emp_06',
        employeeCode: 'EMP-1006',
        employeeName: 'David Miller',
        department: 'Facilities & Maintenance',
        date: todayStr,
        timeIn: '06:58 AM',
        timeOut: '',
        status: 'Present',
        workHours: 8,
        overtimeHours: 1.0,
        shift: 'Morning (07:00 - 15:00)',
        remarks: 'Plumbing dispatch for leak WLK-2026-001.',
        markedBy: 'Biometric Scanner #4',
        createdAt: now.toISOString(),
      },
    ];

    this.inMemoryData.leaves = [
      {
        _id: 'leave_01',
        employeeId: 'emp_02',
        employeeCode: 'EMP-1002',
        employeeName: 'Sarah Jenkins',
        department: 'Emergency Medicine',
        leaveType: 'Annual',
        startDate: '2026-11-20',
        endDate: '2026-11-25',
        daysCount: 5,
        reason: 'Scheduled annual family leave during Thanksgiving recess. Relief nurse roster confirmed.',
        status: 'Pending',
        appliedOn: '2026-11-05',
        reviewedBy: '',
        reviewedDate: '',
        reviewRemarks: '',
        createdAt: now.toISOString(),
      },
      {
        _id: 'leave_02',
        employeeId: 'emp_05',
        employeeCode: 'EMP-1005',
        employeeName: 'Evelyn Martinez',
        department: 'Surgical Services & OR',
        leaveType: 'Study / Conference',
        startDate: '2026-12-02',
        endDate: '2026-12-05',
        daysCount: 4,
        reason: 'Invited Keynote Speaker at American College of Surgeons (ACS) Annual Clinical Congress.',
        status: 'Approved',
        appliedOn: '2026-10-25',
        reviewedBy: 'Dr. Eleanor Vance',
        reviewedDate: '2026-10-28',
        reviewRemarks: 'Approved with hospital institutional continuing education stipend.',
        createdAt: new Date('2026-10-25').toISOString(),
      },
      {
        _id: 'leave_03',
        employeeId: 'emp_06',
        employeeCode: 'EMP-1006',
        employeeName: 'David Miller',
        department: 'Facilities & Maintenance',
        leaveType: 'Casual',
        startDate: '2026-11-12',
        endDate: '2026-11-12',
        daysCount: 1,
        reason: 'Personal family legal appointment.',
        status: 'Approved',
        appliedOn: '2026-11-01',
        reviewedBy: 'Arthur Pendelton',
        reviewedDate: '2026-11-02',
        reviewRemarks: 'Coverage assigned to Assistant Engineer Thompson.',
        createdAt: new Date('2026-11-01').toISOString(),
      },
    ];

    this.inMemoryData.records = [
      {
        _id: 'rec_01',
        employeeId: 'emp_01',
        employeeCode: 'EMP-1001',
        employeeName: 'Eleanor Vance',
        documentType: 'Medical License',
        documentTitle: 'State Board of Medicine License to Practice - Physician & Surgeon',
        documentNumber: 'MD-99214-GA',
        issueDate: '2016-06-01',
        expiryDate: '2027-06-01',
        verificationStatus: 'Verified',
        notes: 'Full unrestricted active state medical license.',
        fileUrl: '/documents/license_vance.pdf',
        fileSize: '2.4 MB',
        uploadedBy: 'Marcus Sterling',
        createdAt: now.toISOString(),
      },
      {
        _id: 'rec_02',
        employeeId: 'emp_02',
        employeeCode: 'EMP-1002',
        employeeName: 'Sarah Jenkins',
        documentType: 'BLS/ACLS Certification',
        documentTitle: 'American Heart Association Advanced Cardiac Life Support (ACLS)',
        documentNumber: 'AHA-ACLS-2024-8891',
        issueDate: '2024-04-10',
        expiryDate: '2026-04-10',
        verificationStatus: 'Verified',
        notes: 'Renewal completed at Regional Medical Training Center.',
        fileUrl: '/documents/acls_jenkins.pdf',
        fileSize: '1.1 MB',
        uploadedBy: 'Marcus Sterling',
        createdAt: now.toISOString(),
      },
      {
        _id: 'rec_03',
        employeeId: 'emp_05',
        employeeCode: 'EMP-1005',
        employeeName: 'Evelyn Martinez',
        documentType: 'DEA Registration',
        documentTitle: 'DEA Controlled Substance Registration Certificate (Schedules II-V)',
        documentNumber: 'BM-7740192',
        issueDate: '2023-01-15',
        expiryDate: '2026-01-15',
        verificationStatus: 'Verified',
        notes: 'Federal DEA registration in good standing.',
        fileUrl: '/documents/dea_martinez.pdf',
        fileSize: '1.8 MB',
        uploadedBy: 'Marcus Sterling',
        createdAt: now.toISOString(),
      },
      {
        _id: 'rec_04',
        employeeId: 'emp_03',
        employeeCode: 'EMP-1003',
        employeeName: 'Arthur Pendelton',
        documentType: 'Employment Contract',
        documentTitle: 'Director of Plant Operations Executive Service Contract',
        documentNumber: 'CTR-2019-FAC01',
        issueDate: '2019-01-20',
        expiryDate: '2028-01-20',
        verificationStatus: 'Verified',
        notes: 'Includes facility emergency response on-call agreement.',
        fileUrl: '/documents/contract_pendelton.pdf',
        fileSize: '3.6 MB',
        uploadedBy: 'Marcus Sterling',
        createdAt: now.toISOString(),
      },
      {
        _id: 'rec_05',
        employeeId: 'emp_02',
        employeeCode: 'EMP-1002',
        employeeName: 'Sarah Jenkins',
        documentType: 'Vaccination Record',
        documentTitle: 'Annual Healthcare Worker Immunization & Hepatitis B Titers',
        documentNumber: 'IMM-2026-IMMUN',
        issueDate: '2026-09-15',
        expiryDate: '2027-09-15',
        verificationStatus: 'Verified',
        notes: 'Includes Influenza 2026/2027 and COVID-19 booster.',
        fileUrl: '/documents/vaccine_jenkins.pdf',
        fileSize: '850 KB',
        uploadedBy: 'Marcus Sterling',
        createdAt: now.toISOString(),
      },
    ];

    this.inMemoryData.auditLogs = [
      {
        _id: 'audit_01',
        timestamp: new Date(now.getTime() - 7200000).toISOString(),
        userId: 'usr_superadmin_01',
        userName: 'Dr. Eleanor Vance',
        userRole: 'SuperAdmin',
        action: 'LOGIN',
        module: 'Auth',
        details: 'Successful administrator login from administrative network terminal.',
        ipAddress: '10.0.1.15',
        createdAt: now.toISOString(),
      },
      {
        _id: 'audit_02',
        timestamp: new Date(now.getTime() - 5400000).toISOString(),
        userId: 'usr_staff_01',
        userName: 'Sarah Jenkins, RN',
        userRole: 'Staff',
        action: 'CREATE',
        module: 'Leak Detection',
        details: 'Reported water leak WLK-2026-001 (Room 304 - Dialysis Bay). High severity alert dispatched.',
        ipAddress: '10.0.3.42',
        createdAt: now.toISOString(),
      },
      {
        _id: 'audit_03',
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        userId: 'usr_facil_01',
        userName: 'Arthur Pendelton',
        userRole: 'Facility Manager',
        action: 'UPDATE',
        module: 'Leak Detection',
        details: 'Assigned Senior Plumber David Miller to leak WLK-2026-001. Status changed to Repair In Progress.',
        ipAddress: '10.0.8.10',
        createdAt: now.toISOString(),
      },
      {
        _id: 'audit_04',
        timestamp: new Date(now.getTime() - 1800000).toISOString(),
        userId: 'usr_hr_01',
        userName: 'Marcus Sterling',
        userRole: 'HR Manager',
        action: 'APPROVE',
        module: 'Leave',
        details: 'Approved conference leave application for Dr. Evelyn Martinez (4 days).',
        ipAddress: '10.0.1.22',
        createdAt: now.toISOString(),
      },
    ];
  }

  // --- CRUD METHODS (Users) ---
  public async getUsers(): Promise<any[]> {
    if (this.isMongooseActive()) {
      return await UserModel.find().select('-password').sort({ createdAt: -1 }).lean();
    }
    return this.inMemoryData.users.map(({ password, ...u }) => u);
  }

  public async getUserById(id: string): Promise<any> {
    if (this.isMongooseActive()) {
      return await UserModel.findById(id).select('-password').lean();
    }
    const u = this.inMemoryData.users.find((x) => x._id === id);
    if (!u) return null;
    const { password, ...safe } = u;
    return safe;
  }

  public async getUserByEmailOrUsername(identifier: string): Promise<any> {
    if (this.isMongooseActive()) {
      return await UserModel.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
      });
    }
    return this.inMemoryData.users.find(
      (x) => x.email.toLowerCase() === identifier.toLowerCase() || x.username.toLowerCase() === identifier.toLowerCase()
    );
  }

  public async createUser(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return (await UserModel.create(data)).toObject();
    }
    const newUser = {
      _id: generateId('usr'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Active',
      ...data,
    };
    this.inMemoryData.users.push(newUser);
    this.persist();
    const { password, ...safe } = newUser;
    return safe;
  }

  public async updateUser(id: string, data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return await UserModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).select('-password').lean();
    }
    const index = this.inMemoryData.users.findIndex((x) => x._id === id);
    if (index === -1) return null;
    this.inMemoryData.users[index] = {
      ...this.inMemoryData.users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    const { password, ...safe } = this.inMemoryData.users[index];
    return safe;
  }

  public async deleteUser(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await UserModel.findByIdAndDelete(id);
      return true;
    }
    const initialLen = this.inMemoryData.users.length;
    this.inMemoryData.users = this.inMemoryData.users.filter((x) => x._id !== id);
    this.persist();
    return this.inMemoryData.users.length < initialLen;
  }

  // --- CRUD METHODS (Employees) ---
  public async getEmployees(filters: any = {}): Promise<any[]> {
    if (this.isMongooseActive()) {
      const q: any = {};
      if (filters.department) q.department = filters.department;
      if (filters.status) q.status = filters.status;
      if (filters.search) {
        q.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { employeeId: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }
      return await EmployeeModel.find(q).sort({ createdAt: -1 }).lean();
    }

    let result = [...this.inMemoryData.employees];
    if (filters.department) {
      result = result.filter((e) => e.department === filters.department);
    }
    if (filters.status) {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.firstName.toLowerCase().includes(s) ||
          e.lastName.toLowerCase().includes(s) ||
          e.employeeId.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s)
      );
    }
    return result;
  }

  public async getEmployeeById(id: string): Promise<any> {
    if (this.isMongooseActive()) {
      return await EmployeeModel.findById(id).lean();
    }
    return this.inMemoryData.employees.find((x) => x._id === id || x.employeeId === id) || null;
  }

  public async createEmployee(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return (await EmployeeModel.create(data)).toObject();
    }
    // Auto-generate employee ID if not provided
    if (!data.employeeId) {
      const nextNum = 1000 + this.inMemoryData.employees.length + 1;
      data.employeeId = `EMP-${nextNum}`;
    }
    const newEmp = {
      _id: generateId('emp'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Active',
      ...data,
    };
    this.inMemoryData.employees.unshift(newEmp);
    this.persist();
    return newEmp;
  }

  public async updateEmployee(id: string, data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return await EmployeeModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = this.inMemoryData.employees.findIndex((x) => x._id === id || x.employeeId === id);
    if (idx === -1) return null;
    this.inMemoryData.employees[idx] = {
      ...this.inMemoryData.employees[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.inMemoryData.employees[idx];
  }

  public async deleteEmployee(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await EmployeeModel.findByIdAndDelete(id);
      return true;
    }
    const before = this.inMemoryData.employees.length;
    this.inMemoryData.employees = this.inMemoryData.employees.filter((x) => x._id !== id && x.employeeId !== id);
    this.persist();
    return this.inMemoryData.employees.length < before;
  }

  // --- CRUD METHODS (Departments) ---
  public async getDepartments(): Promise<any[]> {
    if (this.isMongooseActive()) {
      return await DepartmentModel.find().sort({ name: 1 }).lean();
    }
    return this.inMemoryData.departments;
  }

  public async createDepartment(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return (await DepartmentModel.create(data)).toObject();
    }
    const newDept = {
      _id: generateId('dept'),
      createdAt: new Date().toISOString(),
      activeEmployeesCount: 0,
      ...data,
    };
    this.inMemoryData.departments.push(newDept);
    this.persist();
    return newDept;
  }

  public async updateDepartment(id: string, data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return await DepartmentModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = this.inMemoryData.departments.findIndex((x) => x._id === id);
    if (idx === -1) return null;
    this.inMemoryData.departments[idx] = { ...this.inMemoryData.departments[idx], ...data, updatedAt: new Date().toISOString() };
    this.persist();
    return this.inMemoryData.departments[idx];
  }

  public async deleteDepartment(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await DepartmentModel.findByIdAndDelete(id);
      return true;
    }
    const before = this.inMemoryData.departments.length;
    this.inMemoryData.departments = this.inMemoryData.departments.filter((x) => x._id !== id);
    this.persist();
    return this.inMemoryData.departments.length < before;
  }

  // --- CRUD METHODS (Leak Records) ---
  public async getLeakRecords(filters: any = {}): Promise<any[]> {
    if (this.isMongooseActive()) {
      const q: any = {};
      if (filters.status) q.status = filters.status;
      if (filters.severity) q.severity = filters.severity;
      if (filters.search) {
        q.$or = [
          { recordNumber: { $regex: filters.search, $options: 'i' } },
          { title: { $regex: filters.search, $options: 'i' } },
          { roomWard: { $regex: filters.search, $options: 'i' } },
          { building: { $regex: filters.search, $options: 'i' } },
        ];
      }
      return await LeakRecordModel.find(q).sort({ createdAt: -1 }).lean();
    }

    let records = [...this.inMemoryData.leakRecords];
    if (filters.status) {
      records = records.filter((r) => r.status === filters.status);
    }
    if (filters.severity) {
      records = records.filter((r) => r.severity === filters.severity);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      records = records.filter(
        (r) =>
          r.recordNumber.toLowerCase().includes(s) ||
          r.title.toLowerCase().includes(s) ||
          r.roomWard.toLowerCase().includes(s) ||
          r.building.toLowerCase().includes(s)
      );
    }
    return records;
  }

  public async getLeakRecordById(id: string): Promise<any> {
    if (this.isMongooseActive()) {
      return await LeakRecordModel.findById(id).lean();
    }
    return this.inMemoryData.leakRecords.find((x) => x._id === id || x.recordNumber === id) || null;
  }

  public async createLeakRecord(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return (await LeakRecordModel.create(data)).toObject();
    }
    if (!data.recordNumber) {
      const count = this.inMemoryData.leakRecords.length + 1;
      const numStr = count.toString().padStart(3, '0');
      data.recordNumber = `WLK-2026-${numStr}`;
    }
    const newLeak = {
      _id: generateId('leak'),
      status: 'Detected',
      reportedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.inMemoryData.leakRecords.unshift(newLeak);
    this.persist();
    return newLeak;
  }

  public async updateLeakRecord(id: string, data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return await LeakRecordModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = this.inMemoryData.leakRecords.findIndex((x) => x._id === id || x.recordNumber === id);
    if (idx === -1) return null;
    this.inMemoryData.leakRecords[idx] = {
      ...this.inMemoryData.leakRecords[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.inMemoryData.leakRecords[idx];
  }

  public async deleteLeakRecord(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await LeakRecordModel.findByIdAndDelete(id);
      return true;
    }
    const before = this.inMemoryData.leakRecords.length;
    this.inMemoryData.leakRecords = this.inMemoryData.leakRecords.filter((x) => x._id !== id && x.recordNumber !== id);
    this.persist();
    return this.inMemoryData.leakRecords.length < before;
  }

  // --- CRUD METHODS (Attendance) ---
  public async getAttendance(filters: any = {}): Promise<any[]> {
    if (this.isMongooseActive()) {
      const q: any = {};
      if (filters.date) q.date = filters.date;
      if (filters.department) q.department = filters.department;
      if (filters.status) q.status = filters.status;
      if (filters.employeeCode) q.employeeCode = filters.employeeCode;
      return await AttendanceModel.find(q).sort({ date: -1, employeeName: 1 }).lean();
    }

    let records = [...this.inMemoryData.attendance];
    if (filters.date) records = records.filter((a) => a.date === filters.date);
    if (filters.department) records = records.filter((a) => a.department === filters.department);
    if (filters.status) records = records.filter((a) => a.status === filters.status);
    if (filters.employeeCode) records = records.filter((a) => a.employeeCode === filters.employeeCode);
    return records;
  }

  public async createOrUpdateAttendance(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      const existing = await AttendanceModel.findOne({ employeeCode: data.employeeCode, date: data.date });
      if (existing) {
        return await AttendanceModel.findByIdAndUpdate(existing._id, { ...data, updatedAt: new Date() }, { new: true }).lean();
      }
      return (await AttendanceModel.create(data)).toObject();
    }

    const idx = this.inMemoryData.attendance.findIndex((a) => a.employeeCode === data.employeeCode && a.date === data.date);
    if (idx !== -1) {
      this.inMemoryData.attendance[idx] = {
        ...this.inMemoryData.attendance[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
      return this.inMemoryData.attendance[idx];
    }

    const newAtt = {
      _id: generateId('att'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workHours: 8,
      overtimeHours: 0,
      ...data,
    };
    this.inMemoryData.attendance.unshift(newAtt);
    this.persist();
    return newAtt;
  }

  public async deleteAttendance(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await AttendanceModel.findByIdAndDelete(id);
      return true;
    }
    const before = this.inMemoryData.attendance.length;
    this.inMemoryData.attendance = this.inMemoryData.attendance.filter((x) => x._id !== id);
    this.persist();
    return this.inMemoryData.attendance.length < before;
  }

  // --- CRUD METHODS (Leave) ---
  public async getLeaves(filters: any = {}): Promise<any[]> {
    if (this.isMongooseActive()) {
      const q: any = {};
      if (filters.status) q.status = filters.status;
      if (filters.leaveType) q.leaveType = filters.leaveType;
      if (filters.department) q.department = filters.department;
      if (filters.employeeCode) q.employeeCode = filters.employeeCode;
      return await LeaveModel.find(q).sort({ createdAt: -1 }).lean();
    }

    let records = [...this.inMemoryData.leaves];
    if (filters.status) records = records.filter((l) => l.status === filters.status);
    if (filters.leaveType) records = records.filter((l) => l.leaveType === filters.leaveType);
    if (filters.department) records = records.filter((l) => l.department === filters.department);
    if (filters.employeeCode) records = records.filter((l) => l.employeeCode === filters.employeeCode);
    return records;
  }

  public async createLeave(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return (await LeaveModel.create(data)).toObject();
    }
    const newLeave = {
      _id: generateId('leave'),
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.inMemoryData.leaves.unshift(newLeave);
    this.persist();
    return newLeave;
  }

  public async updateLeave(id: string, data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return await LeaveModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = this.inMemoryData.leaves.findIndex((x) => x._id === id);
    if (idx === -1) return null;
    this.inMemoryData.leaves[idx] = {
      ...this.inMemoryData.leaves[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.inMemoryData.leaves[idx];
  }

  public async deleteLeave(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await LeaveModel.findByIdAndDelete(id);
      return true;
    }
    const before = this.inMemoryData.leaves.length;
    this.inMemoryData.leaves = this.inMemoryData.leaves.filter((x) => x._id !== id);
    this.persist();
    return this.inMemoryData.leaves.length < before;
  }

  // --- CRUD METHODS (Employee Documents & Records) ---
  public async getEmployeeRecords(filters: any = {}): Promise<any[]> {
    if (this.isMongooseActive()) {
      const q: any = {};
      if (filters.documentType) q.documentType = filters.documentType;
      if (filters.verificationStatus) q.verificationStatus = filters.verificationStatus;
      if (filters.employeeCode) q.employeeCode = filters.employeeCode;
      return await EmployeeRecordModel.find(q).sort({ createdAt: -1 }).lean();
    }

    let records = [...this.inMemoryData.records];
    if (filters.documentType) records = records.filter((r) => r.documentType === filters.documentType);
    if (filters.verificationStatus) records = records.filter((r) => r.verificationStatus === filters.verificationStatus);
    if (filters.employeeCode) records = records.filter((r) => r.employeeCode === filters.employeeCode);
    return records;
  }

  public async createEmployeeRecord(data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return (await EmployeeRecordModel.create(data)).toObject();
    }
    const newRec = {
      _id: generateId('doc'),
      verificationStatus: 'Pending Verification',
      fileSize: '1.4 MB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.inMemoryData.records.unshift(newRec);
    this.persist();
    return newRec;
  }

  public async updateEmployeeRecord(id: string, data: any): Promise<any> {
    if (this.isMongooseActive()) {
      return await EmployeeRecordModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = this.inMemoryData.records.findIndex((x) => x._id === id);
    if (idx === -1) return null;
    this.inMemoryData.records[idx] = {
      ...this.inMemoryData.records[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.inMemoryData.records[idx];
  }

  public async deleteEmployeeRecord(id: string): Promise<boolean> {
    if (this.isMongooseActive()) {
      await EmployeeRecordModel.findByIdAndDelete(id);
      return true;
    }
    const before = this.inMemoryData.records.length;
    this.inMemoryData.records = this.inMemoryData.records.filter((x) => x._id !== id);
    this.persist();
    return this.inMemoryData.records.length < before;
  }

  // --- CRUD METHODS (Audit Logs) ---
  public async getAuditLogs(filters: any = {}): Promise<any[]> {
    if (this.isMongooseActive()) {
      const q: any = {};
      if (filters.module) q.module = filters.module;
      if (filters.action) q.action = filters.action;
      if (filters.userName) q.userName = { $regex: filters.userName, $options: 'i' };
      return await AuditLogModel.find(q).sort({ timestamp: -1 }).limit(100).lean();
    }

    let logs = [...this.inMemoryData.auditLogs];
    if (filters.module) logs = logs.filter((l) => l.module === filters.module);
    if (filters.action) logs = logs.filter((l) => l.action === filters.action);
    if (filters.userName) {
      logs = logs.filter((l) => l.userName.toLowerCase().includes(filters.userName.toLowerCase()));
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async createAuditLog(data: any): Promise<any> {
    const entry = {
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      ...data,
    };
    if (this.isMongooseActive()) {
      try {
        await AuditLogModel.create(entry);
      } catch (err) {
        console.error('AuditLog insert error:', err);
      }
    }
    const newLog = {
      _id: generateId('audit'),
      createdAt: new Date().toISOString(),
      ...entry,
    };
    this.inMemoryData.auditLogs.unshift(newLog);
    // Keep max 500 audit logs locally
    if (this.inMemoryData.auditLogs.length > 500) {
      this.inMemoryData.auditLogs.pop();
    }
    this.persist();
    return newLog;
  }

  // --- DASHBOARD AGGREGATIONS ---
  public async getDashboardMetrics(): Promise<any> {
    const employees = await this.getEmployees();
    const leakRecords = await this.getLeakRecords();
    const attendance = await this.getAttendance({ date: new Date().toISOString().split('T')[0] });
    const leaves = await this.getLeaves();
    const departments = await this.getDepartments();
    const auditLogs = await this.getAuditLogs();
    const records = await this.getEmployeeRecords();

    const activeEmployees = employees.filter((e) => e.status === 'Active').length;
    const onLeaveEmployees = employees.filter((e) => e.status === 'On Leave').length;
    const openLeaks = leakRecords.filter((l) => l.status !== 'Resolved' && l.status !== 'Closed').length;
    const criticalLeaks = leakRecords.filter((l) => l.severity === 'Critical' && l.status !== 'Closed' && l.status !== 'Resolved').length;
    const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
    const todayPresent = attendance.filter((a) => a.status === 'Present').length;
    const todayLate = attendance.filter((a) => a.status === 'Late').length;

    // Dept distribution
    const deptStats = departments.map((d) => {
      const count = employees.filter((e) => e.department === d.name).length;
      return {
        name: d.name,
        code: d.code,
        count,
        budget: d.budget,
      };
    });

    return {
      stats: {
        totalEmployees: employees.length,
        activeEmployees,
        onLeaveEmployees,
        openLeaks,
        criticalLeaks,
        pendingLeaves,
        todayAttendance: {
          present: todayPresent,
          late: todayLate,
          totalMarked: attendance.length,
          rate: employees.length > 0 ? Math.round(((todayPresent + todayLate) / employees.length) * 100) : 0,
        },
        complianceDocs: {
          total: records.length,
          verified: records.filter((r) => r.verificationStatus === 'Verified').length,
          pending: records.filter((r) => r.verificationStatus === 'Pending Verification').length,
        },
      },
      departmentDistribution: deptStats,
      recentLeaks: leakRecords.slice(0, 5),
      pendingLeavesList: leaves.filter((l) => l.status === 'Pending').slice(0, 5),
      recentActivity: auditLogs.slice(0, 8),
    };
  }
}

export const storage = new StorageManager();
export default storage;
