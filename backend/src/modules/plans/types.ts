import type { SupportedLocale } from '@/types/common';

export type PlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export type PlanDay = Record<string, unknown>; // MVP için esnek yapı

export type PlanBase = {
  planId: string;
  studentKey: string;
  topicCode?: string;
  status: PlanStatus;
  estTimeMin: number;
  days: PlanDay[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PlanCreateInput = {
  studentKey: string;
  topicCode?: string;
  estTimeMin?: number;
  days?: PlanDay[];
  locale?: SupportedLocale; // Telemetri/analiz için istersen burada da taşıyabilirsin (opsiyonel)
};

export type PlanUpdateInput = Partial<Pick<PlanBase, 'topicCode' | 'estTimeMin' | 'days' | 'status'>>;
