import { Router } from 'express';
import { getTamvSnapshot } from '../controllers/tamv.controller';

const router = Router();

router.get('/snapshot', getTamvSnapshot);

export default router;
