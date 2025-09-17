import { Schema, model, type InferSchemaType } from 'mongoose';
import { baseModelPlugin } from '@/db/plugins/baseModel';
import { SUPPORTED_LOCALES } from '@/config/locales'; // 👈 sabit buradan

const eventSchema = new Schema(
  {
    event: { type: String, required: true, index: true },
    eventVersion: { type: String, default: 'v0.1' },
    role: { type: String, enum: ['student', 'teacher', 'admin'] },
    locale: { type: String, enum: SUPPORTED_LOCALES },
    studentKey: { type: String },
    abVariant: { type: String },
    payload: { type: Schema.Types.Mixed, default: {} },
    ts: { type: Date, default: () => new Date(), index: true },
  },
  { collection: 'events_raw' },
);

eventSchema.plugin(baseModelPlugin);
eventSchema.index({ tenantId: 1, event: 1, ts: 1 });

export type TelemetryEventDoc = InferSchemaType<typeof eventSchema> & { id: string };
export const EventModel = model('Event', eventSchema);
