import type { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';
import { parseCreatePlan, parseUpdatePlan } from './validation';
import { createDraftPlan, acceptPlan } from '@/services/planService';
// Eğer update ve list eklemek istersen PlanModel'i import edebilirsin:
// import { PlanModel } from './model';

export const postPlan = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const body = (() => {
    try {
      return parseCreatePlan(req.body);
    } catch (e: any) {
      throw new AppError(422, 'INVALID_BODY', e.message);
    }
  })();

  const plan = await createDraftPlan({ tenantId, ...body });
  res.status(201).json(plan);
});

export const acceptPlanHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const planId = req.params.planId;
  const updated = await acceptPlan(tenantId, planId);
  if (!updated) throw new AppError(404, 'PLAN_NOT_FOUND');
  res.json(updated);
});

// Opsiyonel: PATCH /api/v1/plans/:planId (ileri aşamada gerekiyorsa)
/*
export const patchPlanHandler = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const planId = req.params.planId;
  const patch = (() => {
    try { return parseUpdatePlan(req.body); } catch (e: any) {
      throw new AppError(422, 'INVALID_BODY', e.message);
    }
  })();

  const doc = await PlanModel.findOneAndUpdate(
    { tenantId, planId },
    { $set: { ...patch, updatedAt: new Date() } },
    { new: true },
  );
  if (!doc) throw new AppError(404, 'PLAN_NOT_FOUND');
  res.json(doc.toJSON());
});
*/
