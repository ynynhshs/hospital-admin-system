import mongoose, { Schema, Document } from 'mongoose';

export interface ILeakRecord extends Document {
  recordNumber: string;
  title: string;
  building: string;
  floor: string;
  roomWard: string;
  pipeSystem: 'Potable Water Supply' | 'Medical Chilled Water' | 'Sterilization Steam/Condensate' | 'Fire Sprinkler Mains' | 'Drainage / Graywater' | 'Roof / Rain Drain';
  waterSource: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Detected' | 'Investigating' | 'Repair In Progress' | 'Resolved' | 'Closed';
  estimatedLossPerHour: string;
  reportedBy: string;
  reportedDate: string;
  technicianAssigned: string;
  repairDetails?: string;
  resolvedDate?: string;
  isWaterShutoffNeeded: boolean;
  equipmentRisk: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeakRecordSchema: Schema = new Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    recordNumber: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    building: { type: String, required: true },
    floor: { type: String, required: true },
    roomWard: { type: String, required: true },
    pipeSystem: {
      type: String,
      enum: [
        'Potable Water Supply',
        'Medical Chilled Water',
        'Sterilization Steam/Condensate',
        'Fire Sprinkler Mains',
        'Drainage / Graywater',
        'Roof / Rain Drain',
      ],
      default: 'Potable Water Supply',
    },
    waterSource: { type: String, required: true },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Detected', 'Investigating', 'Repair In Progress', 'Resolved', 'Closed'],
      default: 'Detected',
    },
    estimatedLossPerHour: { type: String, default: '5 Liters/hr' },
    reportedBy: { type: String, required: true },
    reportedDate: { type: String, required: true },
    technicianAssigned: { type: String, default: 'Unassigned' },
    repairDetails: { type: String, default: '' },
    resolvedDate: { type: String },
    isWaterShutoffNeeded: { type: Boolean, default: false },
    equipmentRisk: { type: String, default: 'None' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const LeakRecordModel = mongoose.models.LeakRecord || mongoose.model<ILeakRecord>('LeakRecord', LeakRecordSchema, 'admin_leak_records');
export default LeakRecordModel;
