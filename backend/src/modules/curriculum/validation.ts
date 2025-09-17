import { z } from 'zod';
import type { ListQuery, CurriculumTopicCreate, CurriculumTopicUpdate } from './types';

// topicCode: harf/rakam/tire/altçizgi; 2–64 karakter
const TopicCode = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[A-Z0-9\-_]+$/i, 'Invalid topicCode format');

// konu yolu: ders>konu>alt_konu (en az 2 seviye)
const TopicPath = z
  .string()
  .min(3)
  .refine((s) => s.includes('>'), 'topicPath must include at least one ">" separator');

export const CreateSchema = z.object({
  courseCode: z.string().min(2).max(64),
  topicCode: TopicCode,
  topicPath: TopicPath,
  unitOrWeek: z.string().min(1).max(64).optional(),
  readingLevel: z.string().min(1).max(64).optional(),
});

export const UpdateSchema = z.object({
  courseCode: z.string().min(2).max(64).optional(),
  topicPath: TopicPath.optional(),
  unitOrWeek: z.string().min(1).max(64).optional(),
  readingLevel: z.string().min(1).max(64).optional(),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
});

export const ListQuerySchema = z.object({
  courseCode: z.string().min(2).max(64).optional(),
  search: z.string().min(1).max(128).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
});

export function parseCreate(input: unknown): CurriculumTopicCreate {
  const parsed = CreateSchema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}

export function parseUpdate(input: unknown): CurriculumTopicUpdate {
  const parsed = UpdateSchema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}

export function parseBulk(input: unknown): CurriculumTopicCreate[] {
  const ArraySchema = z.array(CreateSchema).min(1).max(1000);
  const parsed = ArraySchema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}

export function parseListQuery(qs: unknown): ListQuery {
  const parsed = ListQuerySchema.safeParse(qs);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}
