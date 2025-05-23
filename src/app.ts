import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config.db';
import vitalSignsRoutes from './routes';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Apply /healthcare to all APIs
app.use('/Rpmpulse', vitalSignsRoutes);

export default app;
