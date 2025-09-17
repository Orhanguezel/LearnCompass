import { Schema, model, type InferSchemaType } from 'mongoose';
import { baseModelPlugin } from '@/db/plugins/baseModel';
import { softDeletePlugin } from '@/db/plugins/softDelete';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/config/locales';

const studentSchema = new Schema(
  {
    studentKey: { type: String, required: true, index: true }, // pseudonym kimlik
    gradeLevel: { type: String, required: true },
    lang: { type: String, enum: SUPPORTED_LOCALES, default: DEFAULT_LOCALE },
    goals: { type: String },
  },
  { collection: 'students' },
);

studentSchema.plugin(baseModelPlugin);
studentSchema.plugin(softDeletePlugin);

studentSchema.index({ tenantId: 1, studentKey: 1 }, { unique: true });

export type StudentDoc = InferSchemaType<typeof studentSchema> & { id: string };
export const StudentModel = model('Student', studentSchema);
