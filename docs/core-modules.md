# Core Modules Documentation

## Overview

The `src/core/` directory contains **external system adapters** — infrastructure components that connect the application to databases, queues, caches, storage, and third-party services. These are implementation details isolated from business logic.

## Module Registry (`core/core.modules.ts`)

```typescript
const modules = [PrismaModule, RedisModule, BullMQModule, RLSModule];

@Module({
  imports: modules,
  exports: modules,
})
export class CoreModules {}
```

---

## 1. Prisma Module (`core/database/prisma/`)

**Exports:** `PrismaService`, `PrismaModule`

### PrismaService

Extends `PrismaClient` with:
- Query logging (slow query detection)
- Soft delete middleware (auto-filters `deletedAt: null`)
- RLS-ready transaction support
- Graceful connect/disconnect

```typescript
// core/database/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      errorFormat: 'pretty',
    });

    // Slow query logging
    this.$on('query', (e) => {
      if (e.duration > 1000) {
        logger.warn(`Slow query: ${e.query} (${e.duration}ms)`);
      }
    });

    // Soft delete middleware
    this.$use(async (params, next) => {
      if (['findUnique', 'findFirst'].includes(params.action)) {
        params.args.where = { ...params.args.where, deletedAt: null };
      }
      if (params.action === 'findMany') {
        params.args.where = { ...params.args.where, deletedAt: null };
      }
      return next(params);
    });
  }

  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

### Usage

```typescript
// In repository
@Injectable()
export class PatientRepository extends BaseRepository<Patient, ...> {
  constructor(prisma: PrismaService) {
    super(prisma.client, 'patient'); // Use .client for typed access
  }
}

// In TransactionService
constructor(private readonly prisma: PrismaService) {}

async run<T>(callback: (tx: PrismaTransaction) => Promise<T>) {
  return this.prisma.client.$transaction(async (tx) => { ... });
}
```

### Prisma Transaction Type

```typescript
// shared/types/database.ts
export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
```

---

## 2. Redis Module (`core/redis/`)

**Exports:** `RedisService`, `RedisModule`

### RedisService

Wraps `ioredis` with connection management:

```typescript
// core/redis/redis.service.ts
@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: config.get('redis.host'),
      port: config.get('redis.port'),
      password: config.get('redis.password'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.client.on('error', (err) => logger.error('Redis error', err));
    this.client.on('connect', () => logger.log('Redis connected'));
  }

  async onModuleInit() { await this.client.connect(); }
  async onModuleDestroy() { await this.client.quit(); }

  getClient(): Redis { return this.client; }

  // Convenience methods
  async get(key: string) { return this.client.get(key); }
  async set(key: string, value: string, ttl?: number) { ... }
  async del(key: string) { return this.client.del(key); }
  async incr(key: string) { return this.client.incr(key); }
  async exists(key: string) { return this.client.exists(key); }
}
```

### Usage

```typescript
// In OtpCacheService
@Injectable()
export class OtpCacheService {
  constructor(private readonly redis: RedisService) {}

  async set(email: string, hash: string) {
    await this.redis.set(`otp:${email}`, hash, 600); // 10 min TTL
  }
}
```

---

## 3. BullMQ Module (`core/bullmq/`)

**Exports:** `BullMQModule`, queue definitions, processors

### Queue Definitions

```typescript
// core/bullmq/queues/email.queue.ts
export const EmailQueueEnum = {
  ACCOUNT_NOTIFICATIONS: 'account-notifications',
} as const;

export const emailQueueConfig = {
  name: EmailQueueEnum.ACCOUNT_NOTIFICATIONS,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};
```

### BullMQ Module

```typescript
// core/bullmq/bullmq.module.ts
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get('bullmq.redisUrl') || config.get('redis.url'),
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue(emailQueueConfig),
  ],
  exports: [BullModule],
})
export class BullMQModule {}
```

### Processor

```typescript
// core/bullmq/processors/email-notification.processor.ts
@Processor(EmailQueueEnum.ACCOUNT_NOTIFICATIONS)
export class EmailNotificationProcessor {
  constructor(private readonly emailService: EmailService) {}

  @Process('send-otp')
  async handleSendOtp(job: Job<{ email: string; code: string; type: string }>) {
    const { email, code, type } = job.data;
    await this.emailService.sendOtpEmail(email, code, type);
  }

  @Process('send-login-notice')
  async handleLoginNotice(job: Job<{ email: string; device: string; location: string }>) {
    const { email, device, location } = job.data;
    await this.emailService.sendLoginNotice(email, device, location);
  }
}
```

### Enqueueing Jobs

```typescript
// In AuthService
constructor(
  @InjectQueue(EmailQueueEnum.ACCOUNT_NOTIFICATIONS)
  private readonly emailQueue: Queue,
) {}

async requestOtp(email: string) {
  const code = generateOtp();
  await this.otpCache.set(email, hashCode(code));

  await this.emailQueue.add('send-otp', {
    email,
    code,
    type: 'verification',
  });
}
```

---

## 4. RLS Module (`common/database/rls/rls.module.ts`)

**Note:** Though in `common/`, it's exported via `CoreModules` because it depends on `PrismaModule`.

```typescript
// common/database/rls/rls.module.ts
@Module({
  imports: [PrismaModule],
  providers: [RLSService, LoggerService],
  exports: [RLSService],
})
export class RLSModule {}
```

See [Database Documentation](database.md#row-level-security-rls) for details.

---

## 5. External Services (`core/external/`)

### Email (`core/external/email/`)

**Transport:** Nodemailer via `@nestjs/mail`

```typescript
// core/external/email/email.module.options.ts
export const createEmailModuleOptions = (config: ConfigService) => ({
  transport: config.get('email.transport') === 'smtp'
    ? config.get('email.smtpUrl')
    : { jsonTransport: true }, // File transport for dev
  defaults: {
    from: `"${config.get('email.fromName')}" <${config.get('email.from')}>`,
  },
});
```

### Email Templates

```typescript
// core/external/email/templates/account-otp.mail.ts
@Injectable()
export class AccountOtpMail {
  constructor(private readonly mailer: MailerService) {}

  async send(to: string, code: string, userName: string) {
    await this.mailer.sendMail({
      to,
      subject: 'Your Clinic ERP Verification Code',
      template: 'account-otp',
      context: { code, userName },
    });
  }
}
```

### Placeholder External Services

| Service | Status | Location |
|---------|--------|----------|
| DICOM | Placeholder | `core/external/dicom/` |
| Insurance | Placeholder | `core/external/insurance/` |
| Payments | Placeholder | `core/external/payments/` |
| SMS | Placeholder | `core/external/sms/` |

Each follows the pattern:
```
core/external/<service>/
├── index.ts          # Exports
├── <service>.service.ts
├── <service>.module.ts
└── types.ts
```

---

## 6. Storage (`core/storage/s3/`)

**Exports:** `S3Service` (placeholder)

```typescript
// core/storage/s3/s3.service.ts
@Injectable()
export class S3Service {
  private client: S3Client;

  constructor(config: ConfigService) {
    this.client = new S3Client({
      region: config.get('s3.region'),
      endpoint: config.get('s3.endpoint'), // For MinIO/localstack
      credentials: {
        accessKeyId: config.get('s3.accessKey'),
        secretAccessKey: config.get('s3.secretKey'),
      },
    });
  }

  async upload(key: string, body: Buffer, contentType: string) { ... }
  async download(key: string) { ... }
  async delete(key: string) { ... }
  async getPresignedUrl(key: string, expiresIn: number) { ... }
}
```

---

## Connection Lifecycle

```
App Startup
    │
    ▼
ConfigurationModule (validates env)
    │
    ▼
CoreModules
    ├── PrismaModule → PrismaService.$connect()
    ├── RedisModule → RedisService.client.connect()
    ├── BullMQModule → BullMQ connection
    └── RLSModule (depends on PrismaModule)
    │
    ▼
CommonModules
    │
    ▼
FeaturesModule
    │
    ▼
App Ready
```

### Graceful Shutdown

```typescript
// main.ts
app.enableShutdownHooks();
process.on('SIGTERM', async () => {
  await app.close(); // Triggers onModuleDestroy for all modules
});
```

Each core service implements:
```typescript
async onModuleDestroy() {
  await this.client.quit(); // Redis
  await this.$disconnect(); // Prisma
  await this.worker.close(); // BullMQ
}
```

---

## Testing Core Modules

### Mock Prisma

```typescript
// test/mocks/prisma.mock.ts
export const mockPrisma = {
  patient: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};
```

### Mock Redis

```typescript
// test/mocks/redis.mock.ts
export const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  exists: jest.fn(),
  quit: jest.fn(),
};
```

### Mock BullMQ

```typescript
// test/mocks/bullmq.mock.ts
export const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  addBulk: jest.fn(),
  getJob: jest.fn(),
  getJobs: jest.fn(),
};
```

---

## Configuration Reference

| Module | Config Keys | Required |
|--------|-------------|----------|
| Prisma | `DATABASE_URL` | Yes |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Yes |
| BullMQ | `BULLMQ_REDIS_URL` (or `REDIS_URL`) | Yes |
| Email | `MAIL_TRANSPORT`, `MAIL_FROM`, `SMTP_URL` (if smtp) | Yes |
| S3 | `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | No |

---

## Adding a New External Adapter

1. Create `core/external/<service>/`
2. Implement `<Service>Service` with `onModuleInit`/`onModuleDestroy`
3. Create `<Service>Module` exporting the service
4. Add to `CoreModules` imports
5. Add config to `config/<service>.config.ts` and `config.schema.ts`
6. Create interface in `common/interfaces/<service>/`
7. Features inject the service interface, not implementation