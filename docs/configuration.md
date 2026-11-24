# Configuration Documentation

## Overview

All configuration is centralized in `src/config/` with **Zod schema validation** at startup. The `ConfigurationModule` loads and validates all environment variables before any other module initializes.

## Configuration Files

| File | Exports | Purpose |
|------|---------|---------|
| `app.config.ts` | `appConfig` | HTTP server, CORS, API prefix |
| `auth.config.ts` | `authConfig` | JWT secrets, expiry, issuer/audience |
| `database.config.ts` | `databaseConfig` | Prisma connection URL |
| `redis.config.ts` | `redisConfig` | Redis client options |
| `bullmq.config.ts` | `bullmqConfig` | Queue defaults |
| `observability.config.ts` | `observabilityConfig` | Log levels, sampling |
| `email.config.ts` | `emailConfig` | Mail transport, OTP settings |
| `config.schema.ts` | `envSchema`, `EnvConfig` | Zod validation schema |
| `configuration.module.ts` | `ConfigurationModule` | Global config module |

## Environment Variables

### Application (`app.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `development \| production \| test` | `development` | Runtime environment |
| `PORT` | `number` | `3000` | HTTP server port |
| `APP_API_PREFIX` | `string` | `api` | Global route prefix |
| `APP_CORS_ORIGIN` | `string` | `http://localhost:3000` | Comma-separated CORS origins |

### Authentication (`auth.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_ACCESS_SECRET` | `string` (min 16) | **required** | Access token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | `string` | `15m` | Access token TTL (e.g., `15m`, `1h`) |
| `JWT_REFRESH_SECRET` | `string` (min 16) | **required** | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | `string` | `90d` | Refresh token TTL |
| `JWT_ISSUER` | `string` | *optional* | JWT `iss` claim |
| `JWT_AUDIENCE` | `string` | *optional* | JWT `aud` claim |

### Database (`database.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | `string` (URL) | **required** | PostgreSQL connection string |

### Redis (`redis.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_URL` | `string` (URL) | *optional* | Full Redis URL (overrides host/port) |
| `REDIS_HOST` | `string` | `localhost` | Redis host |
| `REDIS_PORT` | `number` | `6379` | Redis port |
| `REDIS_PASSWORD` | `string` | *optional* | Redis password |

### BullMQ (`bullmq.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `BULLMQ_REDIS_URL` | `string` (URL) | *optional* | Dedicated Redis for queues (falls back to `REDIS_URL`) |

### Observability (`observability.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `OBSERVABILITY_LOG_LEVEL` | `debug \| info \| warn \| error` | `info` | Minimum log level |
| `OBSERVABILITY_SAMPLE_RATE` | `number` (0-1) | `1.0` | Request logging sample rate |

### Email (`email.config.ts`)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MAIL_TRANSPORT` | `file \| smtp` | `file` | Email delivery method |
| `MAIL_FROM` | `string` (email) | `verification@example.com` | From address |
| `MAIL_FROM_NAME` | `string` | `Clinic ERP` | From name |
| `SMTP_URL` | `string` (URL) | *required if smtp* | SMTP connection URL |
| `EMAIL_OTP_HASH_SECRET` | `string` (min 32) | **required** | HMAC secret for OTP hashing |
| `EMAIL_CODE_MAX_ATTEMPTS` | `number` (1-10) | `5` | Max OTP verification attempts |
| `EMAIL_REQUEST_LIMIT_PER_HOUR` | `number` (1+) | `5` | Rate limit for OTP requests |

## Validation Rules (`config.schema.ts`)

The Zod schema enforces:

1. **Type coercion** — `z.coerce.number()` for ports, limits
2. **String constraints** — `min()`, `email()`, `url()`, `trim()`
3. **Enum restrictions** — `NODE_ENV`, `MAIL_TRANSPORT`, `LOG_LEVEL`
4. **Cross-field validation** (`.superRefine()`):
   - `SMTP_URL` required when `MAIL_TRANSPORT === 'smtp'`
   - `MAIL_TRANSPORT=file` rejected in `production`

## Accessing Configuration

### In Services/Controllers

```typescript
import { ConfigService } from '@nestjs/config';
import { ConfigConsts } from '@/shared/constants/config';

@Injectable()
export class MyService {
  constructor(private readonly config: ConfigService) {}

  getPort(): number {
    return this.config.getOrThrow<number>(ConfigConsts.app.port);
  }

  getJwtSecret(): string {
    return this.config.getOrThrow<string>(ConfigConsts.auth.jwt.accessSecret);
  }
}
```

### Typed Config Keys (`shared/constants/config.ts`)

```typescript
export const ConfigConsts = {
  app: {
    nodeEnv: 'NODE_ENV',
    port: 'PORT',
    apiPrefix: 'APP_API_PREFIX',
    corsOrigin: 'APP_CORS_ORIGIN',
  },
  auth: {
    jwt: {
      accessSecret: 'JWT_ACCESS_SECRET',
      accessExpiresIn: 'JWT_ACCESS_EXPIRES_IN',
      refreshSecret: 'JWT_REFRESH_SECRET',
      refreshExpiresIn: 'JWT_REFRESH_EXPIRES_IN',
      issuer: 'JWT_ISSUER',
      audience: 'JWT_AUDIENCE',
    },
  },
  database: {
    url: 'DATABASE_URL',
  },
  redis: {
    url: 'REDIS_URL',
    host: 'REDIS_HOST',
    port: 'REDIS_PORT',
    password: 'REDIS_PASSWORD',
  },
  bullmq: {
    redisUrl: 'BULLMQ_REDIS_URL',
  },
  observability: {
    logging: {
      level: 'OBSERVABILITY_LOG_LEVEL',
      sampleRate: 'OBSERVABILITY_SAMPLE_RATE',
    },
  },
  email: {
    transport: 'MAIL_TRANSPORT',
    from: 'MAIL_FROM',
    fromName: 'MAIL_FROM_NAME',
    smtpUrl: 'SMTP_URL',
    otpHashSecret: 'EMAIL_OTP_HASH_SECRET',
    otpMaxAttempts: 'EMAIL_CODE_MAX_ATTEMPTS',
    requestLimitPerHour: 'EMAIL_REQUEST_LIMIT_PER_HOUR',
  },
} as const;
```

## Configuration Module Registration

```typescript
// src/config/configuration.module.ts
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        redisConfig,
        bullmqConfig,
        observabilityConfig,
        emailConfig,
      ],
      validate: (config) => ({
        ...config,
        ...envSchema.parse(config), // Zod validation
      }),
      envFilePath: '.env.dev', // Development default
      cache: true,
    }),
  ],
})
export class ConfigurationModule {}
```

**Load order matters** — `ConfigurationModule` is imported first in `AppModule`.

## Environment Files

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.example` | Template with all variables | Yes |
| `.env.dev` | Local development overrides | No (gitignored) |
| `.env.production` | Production values | No (gitignored) |
| `.env.test` | Test environment | No (gitignored) |

## Runtime Validation

On startup, invalid configuration throws immediately:

```
[ERROR] Invalid configuration:
  - JWT_ACCESS_SECRET: String must contain at least 16 character(s)
  - SMTP_URL: SMTP_URL is required when MAIL_TRANSPORT=smtp
```

## Best Practices

1. **Never access `process.env` directly** — always use `ConfigService`
2. **Use `getOrThrow()`** for required values — fails fast with clear message
3. **Group related config** in separate files (`auth.config.ts`, `email.config.ts`)
4. **Validate at startup** — Zod schema catches typos/missing vars early
5. **Keep secrets out of repo** — use `.env.dev` locally, secret manager in prod
6. **Document all variables** in `.env.example` with comments