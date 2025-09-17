import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5033),

  // Burayı güncelledik ⬇
  MONGO_URI: z
    .string()
    .transform((s) => s.trim())
    .refine(
      (s) => /^mongodb(\+srv)?:\/\//.test(s),
      'MONGO_URI must start with mongodb:// or mongodb+srv://'
    ),

  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  MAGIC_JWT_SECRET: z.string().min(16),
  MAGIC_TTL_MIN: z.coerce.number().min(5).max(60).default(15),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  DEFAULT_LOCALE: z.enum(['tr', 'en', 'de']).default('tr'),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
