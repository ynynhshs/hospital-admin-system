import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
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
  address: string;
  bloodGroup: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    role: { type: String, default: 'Hospital Staff' },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
      default: 'Full-Time',
    },
    dateOfJoining: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated'],
      default: 'Active',
    },
    shift: {
      type: String,
      default: 'Morning (07:00 - 15:00)',
    },
    salary: { type: Number, default: 65000 },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    address: { type: String, default: '' },
    bloodGroup: { type: String, default: 'O+' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema, 'admin_employees');
export default EmployeeModel;
