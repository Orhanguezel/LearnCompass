import { Router } from 'express';
import { ingestEvent } from './controller';
import { requireTenant } from '@/middlewares/tenant';

const router = Router();

// POST /api/v1/events
router.post('/', requireTenant, ingestEvent);

export default router;
