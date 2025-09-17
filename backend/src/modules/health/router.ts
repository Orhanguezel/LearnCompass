import { Router } from 'express';
import { getHealth } from './controller';

const router = Router();

// GET /api/v1/health
router.get('/', getHealth);

export default router;
