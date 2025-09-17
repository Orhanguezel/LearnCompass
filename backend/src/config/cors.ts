import type { CorsOptions } from 'cors';
import { env } from './env';


const origins = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());


export const corsOptions: CorsOptions = {
    origin: origins,
    credentials: true,
};