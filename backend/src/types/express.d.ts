import 'express-serve-static-core';
import type { Role } from '../middlewares/auth';


declare module 'express-serve-static-core' {
    interface Request {
        auth?: { sub: string; role: Role; tenantId: string; exp: number };
        tenantId?: string;
    }
    interface Response {
        locals: { requestId?: string };
    }
}