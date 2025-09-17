// curriculum/model.ts
import { Schema, model, type InferSchemaType } from 'mongoose';
import { baseModelPlugin } from '@/db/plugins/baseModel';


const topicSchema = new Schema(
    {
        courseCode: { type: String, required: true },
        topicCode: { type: String, required: true, unique: true },
        topicPath: { type: String, required: true }, // ders>konu>alt_konu
        unitOrWeek: { type: String },
        readingLevel: { type: String },
    },
    { collection: 'curriculum_topics' },
);


topicSchema.plugin(baseModelPlugin);


export type CurriculumTopic = InferSchemaType<typeof topicSchema> & { id: string };
export const CurriculumTopicModel = model('curriculumtopic', topicSchema);