import { Request, Response } from 'express';
import { VitalSignsModel } from '../model.ts/vital';
import { v4 as uuidv4 } from 'uuid';

const calculateAverage = (arr: number[]): number =>
  arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0;

const roundValue = (value: number): number => Math.round(value);

export const createVitalSigns = async (req: Request, res: Response):Promise<any> => {
  try {
    const { heartRate, breathRate, createdAt } = req.body;
    if (typeof heartRate !== 'number' || typeof breathRate !== 'number' || !createdAt) {
      return res.status(400).json({
        message: 'heartRate, breathRate, and createdAt are required fields.'
      });
    }

    const saved = await VitalSignsModel.create({
      heart_rate: roundValue(heartRate),
      breath_rate: roundValue(breathRate),
      created_at: createdAt,
      timestamps: new Date()
    });

    return res.status(201).json({
      message: 'Health record saved successfully.',
      data: {
        heartRate: saved.heart_rate,
        breathRate: saved.breath_rate,
        takenAt: saved.created_at
      }
    });
  } catch (err) {
    console.error('[createVitalSigns]', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRecentVitalSigns = async (_: Request, res: Response):Promise<any> => {
  try {
    const recentVitals = await VitalSignsModel.find({})
      .sort({ timestamps: -1 })
      .limit(7)
      .lean();

    const reversed = recentVitals.reverse();
    const heartRates = reversed.map(d => d.heart_rate);
    const breathRates = reversed.map(d => d.breath_rate);
    const createdAt = reversed.map(d => d.created_at);

    return res.status(200).json({
      heartRate: {
        readings: heartRates,
        takenAt: createdAt,
        avgOfLast7Readings: Math.round(calculateAverage(heartRates))
      },
      breathRate: {
        readings: breathRates,
        takenAt: createdAt,
        avgOfLast7Readings: Math.round(calculateAverage(breathRates))
      }
    });
  } catch (err) {
    console.error('[getRecentVitalSigns]', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
