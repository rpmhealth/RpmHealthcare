

import { Request, Response } from 'express';
import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


const VitalSignsSchema = new Schema({
  heart_rate: { type: Number, required: true },
  breath_rate: { type: Number, required: true },
  created_at: { type: String, required: true },  
  timestamps: { type: Date, required: true }   
});

const VitalSignsModel = model('VitalSigns', VitalSignsSchema);


const calculateAverage = (arr: number[]): number =>
  arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0;


const roundValue = (value: number): number => Math.round(value);


const generateUniqueId = (createdAt: string): string => {
  const timestamp = new Date(createdAt).getTime();  
  return `${timestamp}-${uuidv4()}`; 
};


export const createVitalSigns = async (req: Request, res: Response): Promise<any> => {
  try {
    const { heartRate, breathRate, createdAt } = req.body;

    if (typeof heartRate !== 'number' || typeof breathRate !== 'number' || !createdAt) {
      return res.status(400).json({
        message: 'heartRate, breathRate, and createdAt are required fields.'
      });
    }

 
    const roundedHeartRate = roundValue(heartRate);
    const roundedBreathRate = roundValue(breathRate);

    const uniqueId = generateUniqueId(createdAt);

    const saved = await VitalSignsModel.create({
      heart_rate: roundedHeartRate,
      breath_rate: roundedBreathRate,
      created_at: createdAt,  // Save the raw string timestamp from frontend
      timestamps:  new Date()   // Store generated unique ID
    });

    return res.status(201).json({
      message: 'Health record saved successfully.',
      data: {
        heartRate: saved.heart_rate,
        breathRate: saved.breath_rate,
        takenAt: saved.created_at,  // Return the exact timestamp
        // uniqueId: saved.unique_id   // Return the generated unique ID
      }
    });
  } catch (err) {
    console.error('[createVitalSigns]', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


// ✅ GET API — Fetch last 7 heart & breath readings
export const getRecentVitalSigns = async (req: Request, res: Response): Promise<any> => {
  try {
    // Fetch the most recent 7 records sorted by the unique ID
    const recentVitals = await VitalSignsModel.find({})
      .sort({ timestamps: -1 })  // Sort by the unique ID in descending order (latest first)
      .limit(7)
      .lean();

   
    const reversedVitals = recentVitals.reverse();

    // Get the heartRates, breathRates, and timestamps
    const heartRates = reversedVitals.map((doc) => doc.heart_rate);
    const breathRates = reversedVitals.map((doc) => doc.breath_rate);
    const createdAt = reversedVitals.map((doc) => doc.created_at);

    return res.status(200).json({
      heartRate: {
        readings: heartRates,
        takenAt: createdAt,
        avgOfLast7Readings: Math.round(calculateAverage(heartRates))  // ✅ Properly rounded average
      },
      breathRate: {
        readings: breathRates,
        takenAt: createdAt,
        avgOfLast7Readings: Math.round(calculateAverage(breathRates))  // ✅ Properly rounded average
      }
    });
  } catch (err) {
    console.error('[getRecentVitalSigns]', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
