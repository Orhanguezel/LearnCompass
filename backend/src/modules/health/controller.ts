import type { Request, Response } from 'express';
import { env } from '@/config/env';

export function getHealth(_req: Request, res: Response) {
  res.json({
    ok: true,
    service: 'learncompass-api',
    env: env.NODE_ENV,
    time: new Date().toISOString(),
  });
}
