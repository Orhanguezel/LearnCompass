import { randomUUID } from 'node:crypto';
import { PlanModel } from '@/modules/plans/model';


export async function createDraftPlan(params: {
    tenantId: string;
    studentKey: string;
    topicCode?: string;
    days?: any[];
    estTimeMin?: number;
}) {
    const planId = 'pl_' + randomUUID();
    const doc = await PlanModel.create({
        tenantId: params.tenantId,
        planId,
        studentKey: params.studentKey,
        topicCode: params.topicCode,
        days: params.days ?? [],
        estTimeMin: params.estTimeMin ?? 60,
    });
    return doc.toJSON();
}


export async function acceptPlan(tenantId: string, planId: string) {
    const plan = await PlanModel.findOneAndUpdate(
        { tenantId, planId },
        { $set: { status: 'active', updatedAt: new Date() } },
        { new: true },
    );
    return plan?.toJSON();
}