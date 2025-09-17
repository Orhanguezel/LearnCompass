import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';


export function notFound(_req: Request, res: Response) {
    res.status(404).json({ error: 'Not Found' });
}


export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    const appErr = err instanceof AppError ? err : AppError.fromUnknown(err);
    const status = appErr.status ?? 500;


    logger.error({ err: appErr, path: req.path, requestId: res.locals.requestId }, appErr.message);
    res.status(status).json({ error: appErr.message, code: appErr.code ?? 'INTERNAL_ERROR' });
}