import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';


export function requestContext(req: Request, res: Response, next: NextFunction) {
const requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
res.locals.requestId = requestId;
next();
}