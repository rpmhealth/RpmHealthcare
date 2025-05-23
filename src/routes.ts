import { Router } from 'express';
import { createVitalSigns, getRecentVitalSigns } from './controller/vital.controlller';

const router = Router();

router.post('/create', createVitalSigns);
router.get('/recent', getRecentVitalSigns);

export default router;
