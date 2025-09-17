import type { Request, Response } from 'express';
import { CurriculumTopicModel } from './model';
import {
  parseCreate,
  parseBulk,
  parseListQuery,
  parseUpdate,
} from './validation';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/utils/AppError';

/**
 * GET /api/v1/curriculum?courseCode=&search=&page=&pageSize=
 * Listeleme + basit arama (topicCode/topicPath regex)
 */
export const listCurriculumTopics = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const q = parseListQuery(req.query);

  const filter: Record<string, unknown> = { tenantId };
  if (q.courseCode) filter.courseCode = q.courseCode;
  if (q.search) {
    filter.$or = [
      { topicCode: { $regex: q.search, $options: 'i' } },
      { topicPath: { $regex: q.search, $options: 'i' } },
    ];
  }

  const items = await CurriculumTopicModel.find(filter)
    .sort({ topicCode: 1 })
    .skip((q.page - 1) * q.pageSize)
    .limit(q.pageSize);

  res.json({
    items: items.map((d) => d.toJSON()),
    pagination: { page: q.page, pageSize: q.pageSize },
  });
});

/**
 * GET /api/v1/curriculum/:topicCode
 */
export const getCurriculumTopic = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const { topicCode } = req.params;
  const doc = await CurriculumTopicModel.findOne({ tenantId, topicCode });
  if (!doc) throw new AppError(404, 'CURR_NOT_FOUND', 'Curriculum topic not found');
  res.json(doc.toJSON());
});

/**
 * POST /api/v1/curriculum
 * Tek kayıt upsert (topicCode + tenantId benzersizliği)
 */
export const upsertCurriculumTopic = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const data = parseCreate(req.body);
  const doc = await CurriculumTopicModel.findOneAndUpdate(
    { tenantId, topicCode: data.topicCode },
    { $set: { ...data, tenantId } },
    { upsert: true, new: true },
  );
  res.status(201).json(doc?.toJSON());
});

/**
 * POST /api/v1/curriculum/bulk
 * Toplu upsert
 */
export const bulkUpsertCurriculum = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const items = parseBulk(req.body);

  const ops = items.map((x) => ({
    updateOne: {
      filter: { tenantId, topicCode: x.topicCode },
      update: { $set: { ...x, tenantId } },
      upsert: true,
    },
  }));

  const result = await CurriculumTopicModel.bulkWrite(ops, { ordered: false });
  res.status(201).json({
    ok: true,
    matched: result.matchedCount,
    modified: result.modifiedCount,
    upserted: result.upsertedCount,
  });
});

/**
 * PATCH /api/v1/curriculum/:topicCode
 */
export const updateCurriculumTopic = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const { topicCode } = req.params;
  const patch = parseUpdate(req.body);

  const doc = await CurriculumTopicModel.findOneAndUpdate(
    { tenantId, topicCode },
    { $set: patch },
    { new: true },
  );
  if (!doc) throw new AppError(404, 'CURR_NOT_FOUND', 'Curriculum topic not found');
  res.json(doc.toJSON());
});

/**
 * DELETE /api/v1/curriculum/:topicCode
 * Not: Model soft delete içermiyor; istersen softDelete plugin’i ekleyebiliriz.
 */
export const deleteCurriculumTopic = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId as string;
  const { topicCode } = req.params;
  const doc = await CurriculumTopicModel.findOneAndDelete({ tenantId, topicCode });
  if (!doc) throw new AppError(404, 'CURR_NOT_FOUND', 'Curriculum topic not found');
  res.status(204).send();
});
