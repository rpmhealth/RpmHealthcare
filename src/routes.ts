import { Router } from 'express';
import { createVitalSigns, getRecentVitalSigns } from './controller/vital.controlller';

const router = Router();

router.post('/vital-signs', createVitalSigns);
router.get('/vital-signs/data', getRecentVitalSigns);

export default router;
