import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';


export type Role = 'admin' | 'teacher' | 'student';


export function requireAuth(req: Request, _res: Response, next: NextFunction) {
const token = (req.headers.authorization?.replace('Bearer ', '') || req.query.token) as
| string
| undefined;
if (!token) throw new AppError(401, 'AUTH_REQUIRED');
try {
const payload = jwt.verify(token, env.MAGIC_JWT_SECRET) as {
sub: string;
role: Role;
tenantId: string;
exp: number;
};
(req as any).auth = payload;
next();
} catch {
throw new AppError(401, 'INVALID_TOKEN');
}
}