import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployeeRecord extends Document {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  documentType:
    | 'Medical License'
    | 'BLS/ACLS Certification'
    | 'DEA Registration'
    | 'Employment Contract'
    | 'Background Check'
    | 'Vaccination Record'
    | 'Academic Degree'
    | 'National ID / Passport';
  documentTitle: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Expired' | 'Rejected';
  notes?: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeRecordSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    employeeId: { type: String, required: true },
    employeeCode: { type: String, required: true },
    employeeName: { type: String, required: true },
    documentType: {
      type: String,
      enum: [
        'Medical License',
        'BLS/ACLS Certification',
        'DEA Registration',
        'Employment Contract',
        'Background Check',
        'Vaccination Record',
        'Academic Degree',
        'National ID / Passport',
      ],
      required: true,
    },
    documentTitle: { type: String, required: true, trim: true },
    documentNumber: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Expired', 'Rejected'],
      default: 'Pending Verification',
    },
    notes: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileSize: { type: String, default: '1.2 MB' },
    uploadedBy: { type: String, default: 'Admin' },
  },
  { timestamps: true }
);

export const EmployeeRecordModel =
  mongoose.models.EmployeeRecord || mongoose.model<IEmployeeRecord>('EmployeeRecord', EmployeeRecordSchema, 'admin_employee_records');
export default EmployeeRecordModel;
