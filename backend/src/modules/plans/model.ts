import { Schema, model, type InferSchemaType } from 'mongoose';
import { baseModelPlugin } from '@/db/plugins/baseModel';

const planSchema = new Schema(
  {
    planId: { type: String, required: true, index: true },
    studentKey: { type: String, required: true, index: true },
    topicCode: { type: String, index: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    estTimeMin: { type: Number, default: 60 },
    days: { type: [Schema.Types.Mixed], default: [] }, // MVP: esnek
  },
  { collection: 'plans' },
);

planSchema.plugin(baseModelPlugin);
planSchema.index({ tenantId: 1, planId: 1 }, { unique: true });
planSchema.index({ tenantId: 1, studentKey: 1, status: 1 });

export type PlanDoc = InferSchemaType<typeof planSchema> & { id: string };
export const PlanModel = model('Plan', planSchema);
