import { Schema, model } from 'mongoose';

const VitalSignsSchema = new Schema({
  heart_rate: { type: Number, required: true },
  breath_rate: { type: Number, required: true },
  created_at: { type: String, required: true },
  timestamps: { type: Date, required: true },
});

export const VitalSignsModel = model('VitalSigns', VitalSignsSchema);
