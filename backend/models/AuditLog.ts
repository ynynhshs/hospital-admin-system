import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
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
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    timestamp: { type: String, default: () => new Date().toISOString() },
    userId: { type: String, default: '' },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'APPROVE', 'REJECT', 'EXPORT'],
      required: true,
    },
    module: {
      type: String,
      enum: [
        'Auth',
        'Users',
        'Employees',
        'Departments',
        'Leak Detection',
        'Attendance',
        'Leave',
        'Documents',
        'Reports',
        'System',
      ],
      required: true,
    },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
);

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema, 'admin_audit_logs');
export default AuditLogModel;
