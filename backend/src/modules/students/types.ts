import type { SupportedLocale } from '@/types/common';

export type StudentBase = {
  studentKey: string;
  gradeLevel: string;
  lang: SupportedLocale;
  goals?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type StudentCreateInput = {
  studentKey: string;
  gradeLevel: string;
  lang?: SupportedLocale;
  goals?: string;
};

export type StudentUpdateInput = Partial<Omit<StudentCreateInput, 'studentKey'>>;
