import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError'


export function requireTenant(req: Request, _res: Response, next: NextFunction) {
    const tenantId = (req.headers['x-tenant-id'] as string) || (req as any).auth?.tenantId;
    if (!tenantId) throw new AppError(400, 'TENANT_REQUIRED');
    (req as any).tenantId = tenantId;
    next();
}