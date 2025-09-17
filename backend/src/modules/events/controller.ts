import type { Request, Response } from 'express';
import { EventModel } from './model';
import { parseEvent } from './validation';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

export const ingestEvent = asyncHandler(async (req: Request, res: Response) => {
  // zod hatasını yakalayıp 422'ye çeviriyoruz
  let data;
  try {
    data = parseEvent(req.body);
  } catch (err: any) {
    throw new AppError(422, 'INVALID_EVENT', err.message);
  }

  const tenantId = req.tenantId as string | undefined;
  if (!tenantId) throw new AppError(400, 'TENANT_REQUIRED');

  const doc = await EventModel.create({ ...data, tenantId });
  res.status(201).json({ id: doc.id });
});
