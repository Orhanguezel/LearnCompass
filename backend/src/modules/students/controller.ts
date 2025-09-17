import type { Request, Response } from 'express';
import { StudentModel } from './model';
import { parseCreate, parseListQuery, parseUpdate } from './validation';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

/**
 * GET /api/v1/students?search=&page=&pageSize=
 * Her rol erişebilir; tenant izolasyonu zorunlu.
 */
export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const q = parseListQuery(req.query);

  const filter: Record<string, unknown> = { tenantId, deletedAt: null };
  if (q.search) {
    filter.$or = [
      { studentKey: { $regex: q.search, $options: 'i' } },
      { goals: { $regex: q.search, $options: 'i' } },
    ];
  }

  const items = await StudentModel.find(filter)
    .sort({ studentKey: 1 })
    .skip((q.page - 1) * q.pageSize)
    .limit(q.pageSize);

  res.json({
    items: items.map((d) => d.toJSON()),
    pagination: { page: q.page, pageSize: q.pageSize },
  });
});

/**
 * GET /api/v1/students/:studentKey
 */
export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const { studentKey } = req.params;

  const doc = await StudentModel.findOne({ tenantId, studentKey, deletedAt: null });
  if (!doc) throw new AppError(404, 'STUDENT_NOT_FOUND');
  res.json(doc.toJSON());
});

/**
 * POST /api/v1/students (upsert)
 * teacher|admin
 */
export const upsertStudent = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;

  let data;
  try {
    data = parseCreate(req.body);
  } catch (e: any) {
    throw new AppError(422, 'INVALID_BODY', e.message);
  }

  const doc = await StudentModel.findOneAndUpdate(
    { tenantId, studentKey: data.studentKey },
    { $set: { ...data, tenantId, deletedAt: null } },
    { upsert: true, new: true },
  );

  res.status(201).json(doc?.toJSON());
});

/**
 * PATCH /api/v1/students/:studentKey
 * teacher|admin
 */
export const patchStudent = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const { studentKey } = req.params;

  let patch;
  try {
    patch = parseUpdate(req.body);
  } catch (e: any) {
    throw new AppError(422, 'INVALID_BODY', e.message);
  }

  const doc = await StudentModel.findOneAndUpdate(
    { tenantId, studentKey, deletedAt: null },
    { $set: { ...patch, updatedAt: new Date() } },
    { new: true },
  );

  if (!doc) throw new AppError(404, 'STUDENT_NOT_FOUND');
  res.json(doc.toJSON());
});

/**
 * DELETE /api/v1/students/:studentKey  (soft delete)
 * admin
 */
export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const { studentKey } = req.params;

  const doc = await StudentModel.findOneAndUpdate(
    { tenantId, studentKey, deletedAt: null },
    { $set: { deletedAt: new Date() } },
    { new: true },
  );

  if (!doc) throw new AppError(404, 'STUDENT_NOT_FOUND');
  res.status(204).send();
});
