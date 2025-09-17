import { z } from 'zod';
import { SUPPORTED_LOCALES } from '@/config/locales';
import type { TelemetryEventCreate } from './types';

export const EventSchema = z.object({
  event: z.string().min(1),
  eventVersion: z.string().min(1).optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  locale: z.enum(SUPPORTED_LOCALES).optional(), // 👈 merkezi liste
  studentKey: z.string().min(1).optional(),
  abVariant: z.string().min(1).optional(),
  payload: z.record(z.any()).optional(),
  ts: z.coerce.date().optional(),
});

export function parseEvent(input: unknown): TelemetryEventCreate {
  const parsed = EventSchema.safeParse(input);
  if (!parsed.success) throw parsed.error;
  return parsed.data;
}
