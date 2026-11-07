import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.ts';
import storage from './storage.ts';
import { UserModel } from './models/User.ts';
import { EmployeeModel } from './models/Employee.ts';
import { DepartmentModel } from './models/Department.ts';
import { LeakRecordModel } from './models/LeakRecord.ts';
import { AttendanceModel } from './models/Attendance.ts';
import { LeaveModel } from './models/Leave.ts';
import { EmployeeRecordModel } from './models/EmployeeRecord.ts';
import { AuditLogModel } from './models/AuditLog.ts';

const runSeed = async () => {
  console.log('🌱 Starting Hospital Administration System Database Seeding...');

  const isConnected = await connectDB();

  // Seed storage engine
  storage.seedInitialData();

  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('📦 Syncing seed records directly into MongoDB Atlas...');
    try {
      // Clear existing records in MongoDB if any
      await UserModel.deleteMany({});
      await EmployeeModel.deleteMany({});
      await DepartmentModel.deleteMany({});
      await LeakRecordModel.deleteMany({});
      await AttendanceModel.deleteMany({});
      await LeaveModel.deleteMany({});
      await EmployeeRecordModel.deleteMany({});
      await AuditLogModel.deleteMany({});

      const data: any = (storage as any).inMemoryData;
      const pairs: [any, string][] = [
        [UserModel, 'users'], [DepartmentModel, 'departments'], [EmployeeModel, 'employees'],
        [LeakRecordModel, 'leakRecords'], [AttendanceModel, 'attendance'], [LeaveModel, 'leaves'],
        [EmployeeRecordModel, 'records'], [AuditLogModel, 'auditLogs'],
      ];
      for (const [Model, key] of pairs) {
        const docs = (data[key] || []).map((d: any) => ({ ...d }));
        if (docs.length) await Model.insertMany(docs, { timestamps: false } as any);
        console.log(`   • ${key}: ${docs.length} documents`);
      }
      console.log('✅ All collections seeded into MongoDB Atlas.');
    } catch (err: any) {
      console.error('MongoDB seed error:', err.message);
    }
  }

  console.log('✨ Seeding process finished successfully.');
  console.log('================================================================');
  console.log('🔑 DEFAULT ADMINISTRATOR CREDENTIALS:');
  console.log('   Email:    admin@hospital.org  (or username: admin)');
  console.log('   Password: Admin123!Secure');
  console.log('   Role:     SuperAdmin');
  console.log('----------------------------------------------------------------');
  console.log('👥 OTHER TEST CREDENTIALS:');
  console.log('   HR Manager:       hrmanager@hospital.org  / HrManager123!');
  console.log('   Facility Manager: facility@hospital.org   / Facility123!');
  console.log('   Staff (Nurse):    nurse@hospital.org      / Staff123!');
  console.log('================================================================');
};

runSeed().then(() => {
  if (process.argv[1]?.includes('seed.ts')) {
    process.exit(0);
  }
});

export default runSeed;
