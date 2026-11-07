import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'SuperAdmin' | 'Admin' | 'HR Manager' | 'Facility Manager' | 'Staff';
  department: string;
  phone: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  lastLogin?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Admin', 'HR Manager', 'Facility Manager', 'Staff'],
      default: 'Staff',
    },
    department: { type: String, default: 'General Administration' },
    phone: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Inactive'],
      default: 'Active',
    },
    lastLogin: { type: Date },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema, 'admin_users');
export default UserModel;
