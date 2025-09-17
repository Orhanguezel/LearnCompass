import { z } from 'zod';
import type { PlanCreateInput, PlanUpdateInput, PlanStatus } from './types';

export const PlanStatusEnum = z.enum(['draft', 'active', 'completed', 'cancelled']);

export const CreatePlanSchema = z.object({
  studentKey: z.string().min(3),
  topicCode: z.string().min(1).optional(),
  days: z.array(z.record(z.any())).optional(),
  estTimeMin: z.number().int().min(15).max(300).optional(),
  // locale eklemek istersen: z.enum(SUPPORTED_LOCALES).optional()
});

export const UpdatePlanSchema = z.object({
  topicCode: z.string().min(1).optional(),
  estTimeMin: z.number().int().min(15).max(300).optional(),
  days: z.array(z.record(z.any())).optional(),
  status: PlanStatusEnum.optional(),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
});

export function parseCreatePlan(input: unknown): PlanCreateInput {
  const parsed = CreatePlanSchema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}

export function parseUpdatePlan(input: unknown): PlanUpdateInput {
  const parsed = UpdatePlanSchema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}
