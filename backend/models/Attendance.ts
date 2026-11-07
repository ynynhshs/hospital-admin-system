import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  timeIn?: string;
  timeOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day' | 'On Leave';
  workHours: number;
  overtimeHours: number;
  shift: string;
  remarks?: string;
  markedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    employeeId: { type: String, required: true },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true },
    timeIn: { type: String, default: '' },
    timeOut: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Half Day', 'On Leave'],
      default: 'Present',
    },
    workHours: { type: Number, default: 8 },
    overtimeHours: { type: Number, default: 0 },
    shift: { type: String, default: 'Morning (07:00 - 15:00)' },
    remarks: { type: String, default: '' },
    markedBy: { type: String, default: 'System' },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per employee per date
AttendanceSchema.index({ employeeCode: 1, date: 1 });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema, 'admin_attendance');
export default AttendanceModel;
