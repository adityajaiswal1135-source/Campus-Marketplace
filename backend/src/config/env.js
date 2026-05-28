import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10)),

  MONGO_URI: z
    .string({ required_error: 'MONGO_URI is required' })
    .url('MONGO_URI must be a valid URL'),

  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters long'),

  JWT_EXPIRES_IN: z
    .string()
    .default('7d'),

  COLLEGE_EMAIL_DOMAIN: z
    .string({ required_error: 'COLLEGE_EMAIL_DOMAIN is required' })
    .startsWith('@', 'COLLEGE_EMAIL_DOMAIN must start with @ (e.g. @university.edu.in)'),

  CLIENT_URL: z
    .string()
    .url('CLIENT_URL must be a valid URL')
    .default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n');
  parsed.error.issues.forEach((issue) => {
    console.error(`  → ${issue.path[0]}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;