import { z } from 'zod';
import { SUPPORTED_LOCALES } from '@/config/locales';
import type { StudentCreateInput, StudentUpdateInput } from './types';

export const CreateStudentSchema = z.object({
  studentKey: z.string().min(3),
  gradeLevel: z.string().min(1),
  lang: z.enum(SUPPORTED_LOCALES).optional(),
  goals: z.string().max(2000).optional(),
});

export const UpdateStudentSchema = z
  .object({
    gradeLevel: z.string().min(1).optional(),
    lang: z.enum(SUPPORTED_LOCALES).optional(),
    goals: z.string().max(2000).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'At least one field is required' });

export const ListQuerySchema = z.object({
  search: z.string().min(1).max(128).optional(), // studentKey veya goals araması
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
});

export function parseCreate(input: unknown): StudentCreateInput {
  const p = CreateStudentSchema.safeParse(input);
  if (!p.success) throw p.error;
  return p.data;
}

export function parseUpdate(input: unknown): StudentUpdateInput {
  const p = UpdateStudentSchema.safeParse(input);
  if (!p.success) throw p.error;
  return p.data;
}

export function parseListQuery(qs: unknown) {
  const p = ListQuerySchema.safeParse(qs);
  if (!p.success) throw p.error;
  return p.data;
}
