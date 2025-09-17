import { Router } from 'express';
import { postPlan, acceptPlanHandler /*, patchPlanHandler*/ } from './controller';
import { requireAuth } from '@/middlewares/auth';
import { requireTenant } from '@/middlewares/tenant';

const router = Router();

// Create draft plan
router.post('/', requireAuth, requireTenant, postPlan);

// Accept a plan
router.post('/:planId/accept', requireAuth, requireTenant, acceptPlanHandler);

// (opsiyonel) Update a plan
// router.patch('/:planId', requireAuth, requireTenant, patchPlanHandler);

export default router;
