import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Emergency' | 'Casual' | 'Study / Conference';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    employeeId: { type: String, required: true },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Maternity', 'Emergency', 'Casual', 'Study / Conference'],
      required: true,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    daysCount: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedOn: { type: String, default: () => new Date().toISOString().split('T')[0] },
    reviewedBy: { type: String, default: '' },
    reviewedDate: { type: String, default: '' },
    reviewRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const LeaveModel = mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema, 'admin_leaves');
export default LeaveModel;
