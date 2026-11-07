import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  floor: string;
  budget: number;
  extension: string;
  activeEmployeesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    headOfDepartment: { type: String, default: 'Pending Appointment' },
    floor: { type: String, default: 'Ground Floor' },
    budget: { type: Number, default: 250000 },
    extension: { type: String, default: '1000' },
    activeEmployeesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DepartmentModel = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema, 'admin_departments');
export default DepartmentModel;
