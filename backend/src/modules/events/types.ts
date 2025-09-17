import type { SupportedLocale, Role } from '@/types/common';

export type TelemetryEventBase = {
  event: string;
  eventVersion?: string;
  role?: Role;
  locale?: SupportedLocale;
  studentKey?: string;
  abVariant?: string;
  payload?: Record<string, unknown>;
  ts?: Date;
};

export type TelemetryEventCreate = TelemetryEventBase;

export type TelemetryEvent = TelemetryEventBase & {
  id: string;
  tenantId: string;
  ts: Date;
};
