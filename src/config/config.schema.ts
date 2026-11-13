import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // Auth Config
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default('90d'),
  JWT_ISSUER: z.string().optional(),
  JWT_AUDIENCE: z.string().optional(),

  // Redis & BullMQ
  REDIS_URL: z.string().url().optional(),
  BULLMQ_REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Database
  DATABASE_URL: z.string().url(),

  // Account email delivery and one-time codes
  MAIL_TRANSPORT: z.enum(['file', 'smtp']).default('file'),
  MAIL_FROM: z.string().email().default('verification@example.com'),
  MAIL_FROM_NAME: z.string().trim().min(1).max(100).default('Clinic ERP'),
  SMTP_URL: z.string().url().optional(),
  EMAIL_OTP_HASH_SECRET: z.string().min(32),
  EMAIL_BCRYPT_ROUNDS: z.coerce.number().int().min(12).max(16).default(12),
  EMAIL_CODE_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(5),
  EMAIL_REQUEST_LIMIT_PER_HOUR: z.coerce.number().int().min(1).default(5),
}).superRefine((config, context) => {
  if (config.MAIL_TRANSPORT === 'smtp' && !config.SMTP_URL) {
    context.addIssue({
      code: 'custom',
      path: ['SMTP_URL'],
      message: 'SMTP_URL is required when MAIL_TRANSPORT=smtp',
    });
  }

  if (config.NODE_ENV === 'production' && config.MAIL_TRANSPORT === 'file') {
    context.addIssue({
      code: 'custom',
      path: ['MAIL_TRANSPORT'],
      message: 'MAIL_TRANSPORT=file is only allowed outside production',
    });
  }
});

export type EnvConfig = z.infer<typeof envSchema>;
