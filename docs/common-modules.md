# Common Modules Documentation

## Overview

The `src/common/` directory contains all cross-cutting concerns organized by **type first, domain second**. These modules provide infrastructure, contracts, and utilities used across all features.

## Module Registry (`common/common.modules.ts`)

```typescript
const modules = [
  AuthenticationModule,  // JWT, Passport strategy
  AuthorizationModule,   // CASL abilities, guards
  HealthModule,          // Health checks
  ObservabilityModule,   // Structured logging
  EventsModule,          // Domain events
];

@Module({
  imports: modules,
  exports: modules,
})
export class CommonModules {}
```

---

## 1. Authentication Module (`common/modules/authentication/`)

**Exports:** `JwtAuthGuard`, `JwtStrategy`, `@CurrentUser()`, `@Public()`

### Components

| File | Purpose |
|------|---------|
| `authentication.module.ts` | Registers Passport JWT strategy |
| `index.ts` | Public exports |

### Usage

```typescript
// In feature module
import { AuthenticationModule } from '@/common/modules/authentication';

@Module({
  imports: [AuthenticationModule],
  // JwtAuthGuard available globally via AppModule
})
export class MyFeatureModule {}
```

---

## 2. Authorization Module (`common/modules/authorization/`)

**Exports:** `AbilityFactory`, `AbilitiesGuard`, `@CheckAbilities()`

### CASL Ability Factory

```typescript
// common/modules/authorization/ability.factory.ts
@Injectable()
export class AbilityFactory {
  createForUser(user: UserPayload): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

    // Role-based permissions
    switch (user.roles[0]) {
      case 'OWNER':
        can('manage', 'all');
        break;
      case 'ADMIN':
        can('manage', ['Patient', 'Appointment', 'Invoice']);
        cannot('delete', 'Organization');
        break;
      case 'PHYSICIAN':
        can('read', 'Patient');
        can('create', 'Encounter');
        can('update', 'Encounter', { providerId: user.sub });
        break;
      case 'NURSE':
        can('read', 'Patient');
        can('create', 'Encounter');
        break;
      case 'STAFF':
        can('read', 'Patient');
        can('read', 'Appointment');
        break;
      case 'BILLING':
        can('manage', 'Invoice');
        can('read', 'Patient');
        break;
    }

    // Organization scoping
    can('manage', 'all', { organizationId: user.organizationId });

    return build({
      detectSubjectType: (item) => item.constructor as SubjectType,
    });
  }
}
```

### Guard & Decorator

```typescript
// common/guards/authorization/abilities.guard.ts
@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAbilities = this.reflector.getAllAndOverride<RequiredAbility[]>(
      CHECK_ABILITIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAbilities) return true;

    const { user } = context.switchToHttp().getRequest();
    const ability = this.abilityFactory.createForUser(user);

    return requiredAbilities.every(({ action, subject }) =>
      ability.can(action, subject),
    );
  }
}

// common/decorators/authorization/check-abilities.decorator.ts
export const CheckAbilities = (...abilities: RequiredAbility[]) =>
  SetMetadata(CHECK_ABILITIES_KEY, abilities);
```

### Usage

```typescript
@Controller('patients')
@UseGuards(JwtAuthGuard, AbilitiesGuard)
export class PatientsController {
  @Post()
  @CheckAbilities({ action: 'create', subject: 'Patient' })
  create(@Body() dto: CreatePatientDto) { ... }

  @Get(':id')
  @CheckAbilities({ action: 'read', subject: 'Patient' })
  findOne(@Param('id') id: string) { ... }
}
```

---

## 3. Observability Module (`common/modules/observability/logging/`)

**Exports:** `LoggerService` (implements `NestLoggerService`)

### LoggerService Features

- **Structured JSON output** with timestamp, level, context, trace
- **Sensitive data redaction** (password, token, SSN, DOB, MRN, etc.)
- **Configurable log levels** via `OBSERVABILITY_LOG_LEVEL`
- **Implements NestJS `LoggerService`** for framework integration

```typescript
// common/modules/observability/logging/logger.service.ts
@Injectable()
export class LoggerService extends ConsoleLogger implements NestLoggerService {
  private readonly SENSITIVE_KEYS = new Set([
    'password', 'token', 'accessToken', 'refreshToken',
    'authorization', 'ssn', 'dob', 'dateOfBirth',
    'mrn', 'insuranceId', 'creditCard', 'cvv',
  ]);

  private redact(value: unknown, depth = 0): unknown { ... }

  error(message, trace?, context?, meta?) { ... }
  warn(message, context?, meta?) { ... }
  debug(message, context?, meta?) { ... }  // Gated by config
  verbose(message, context?, meta?) { ... }
  fatal(message, trace?, context?, meta?) { ... }
}
```

### Usage

```typescript
@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  doSomething() {
    this.logger.log('Operation started', 'MyService', { userId: '123' });
    this.logger.debug('Debug details', 'MyService', { payload: { ... } });
  }
}
```

### Log Output Format

```json
{
  "timestamp": "2024-11-14T10:30:00.000Z",
  "level": "info",
  "message": "Operation started",
  "context": "MyService",
  "meta": { "userId": "123" }
}
```

---

## 4. Health Module (`common/health/`)

**Exports:** `HealthController`, `HealthModule`, health indicators

### Components

| File | Purpose |
|------|---------|
| `health.controller.ts` | `/health` and `/health/live` endpoints |
| `health.module.ts` | Registers indicators |
| `indicators/database.health.ts` | Prisma connectivity check |
| `indicators/redis.health.ts` | Redis connectivity check |

### Endpoints

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /health` | Full health check (DB, Redis) | Public |
| `GET /health/live` | Liveness probe (always OK) | Public |

### Health Indicator Interface

```typescript
// common/health/indicators/database.health.ts
@Injectable()
export class DatabaseHealthIndicator implements HealthIndicator {
  constructor(private readonly prisma: PrismaService) {}

  async isHealthy(): Promise<HealthCheckResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up', component: 'database' };
    } catch (error) {
      return { status: 'down', component: 'database', error: error.message };
    }
  }
}
```

---

## 5. Events Module (`common/events/`)

**Exports:** `EventEmitter2`, domain event classes

### Event Structure

```typescript
// common/events/auth/user-registered.event.ts
export class UserRegisteredEvent {
  constructor(
    public readonly user: UserEntity,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// common/events/billing/invoice-created.event.ts
export class InvoiceCreatedEvent {
  constructor(
    public readonly invoice: InvoiceEntity,
    public readonly timestamp: Date = new Date(),
  ) {}
}
```

### Publishing Events

```typescript
@Injectable()
export class PatientsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createPatient(dto: CreatePatientDto): Promise<PatientEntity> {
    const patient = await this.transactionService.run(tx =>
      this.patientRepository.create(tx, dto),
    );

    // Emit domain event
    this.eventEmitter.emit('patient.created', new PatientCreatedEvent(patient));

    return patient;
  }
}
```

### Subscribing to Events

```typescript
// In a listener service
@Injectable()
export class NotificationListener {
  @OnEvent('patient.created')
  async handlePatientCreated(event: PatientCreatedEvent) {
    await this.notificationService.sendWelcome(event.user);
  }
}
```

---

## 6. Security Module (`common/modules/security/`)

**Exports:** `PasswordService` (Argon2id)

```typescript
// common/modules/security/security.module.ts
@Global()
@Module({
  providers: [
    {
      provide: 'ARGON2_OPTIONS',
      useValue: {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      },
    },
    PasswordService,
  ],
  exports: [PasswordService],
})
export class SecurityModule {}
```

---

## 7. Database Layer (`common/database/`)

### Repositories (`common/database/repositories/`)

```typescript
// base.repository.ts
export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly modelName: string,
  ) {}

  async create(tx: PrismaTransaction, dto: CreateDto): Promise<T> { ... }
  async findById(tx: PrismaTransaction, id: string): Promise<T | null> { ... }
  async findMany(tx: PrismaTransaction, args): Promise<T[]> { ... }
  async update(tx: PrismaTransaction, id: string, dto: UpdateDto): Promise<T> { ... }
  async delete(tx: PrismaTransaction, id: string): Promise<T> { ... } // Soft delete
}
```

### RLS (`common/database/rls/`)

```typescript
// rls.service.ts
@Injectable()
export class RLSService {
  async applyContext(
    tx: PrismaTransaction,
    context: { userId: string; organizationId: string; locationId?: string },
  ): Promise<void> {
    await tx.$executeRaw`
      SET LOCAL "app.current_user_id" = ${context.userId};
      SET LOCAL "app.current_organization_id" = ${context.organizationId};
      ${context.locationId ? Prisma.sql`SET LOCAL "app.current_location_id" = ${context.locationId};` : Prisma.empty}
    `;
  }
}
```

### Transactions (`common/database/transaction/`)

```typescript
// transaction.service.ts
@Observed()
@Injectable()
export class TransactionService {
  public async run<T>(callback: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
    const context = this.requestContextStorage.getContext();
    if (!context) throw new Error('No request context');

    return this.prisma.client.$transaction(async (tx) => {
      await this.rlsService.applyContext(tx, context);
      return callback(tx);
    });
  }
}
```

---

## 8. HTTP Layer (`common/http/`)

### Middleware

```typescript
// middleware/request-id.middleware.ts
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req, res, next) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
```

### Request Context Storage

```typescript
// interceptors/request-context.storage.ts
@Injectable()
export class RequestContextStorage {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }
}

// interceptors/request-context.interceptor.ts
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly storage: RequestContextStorage) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const ctx: RequestContext = {
      userId: request.user?.sub,
      organizationId: request.user?.organizationId,
      locationId: request.user?.locationId,
      requestId: request.headers['x-request-id'],
    };
    return this.storage.run(ctx, () => next.handle());
  }
}
```

---

## 9. Interceptors (`common/interceptors/`)

| Interceptor | Purpose |
|-------------|---------|
| `ResponseInterceptor` | Wraps response in `{ data, meta, timestamp }` |
| `ErrorInterceptor` | Normalizes errors to `AppException` format |
| `ObservabilityInterceptor` | Logs request/response with timing |

### Response Envelope

```json
{
  "data": { ... },
  "meta": { "requestId": "uuid", "timestamp": "2024-11-14T10:30:00.000Z" },
  "timestamp": "2024-11-14T10:30:00.000Z"
}
```

---

## 10. Filters (`common/filters/`)

```typescript
// all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const ctx = host.switchToHttp();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof Error
      ? exception.message
      : 'Internal server error';

    const response = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      error: message,
    };

    httpAdapter.reply(ctx.getResponse(), response, status);
  }
}
```

---

## 11. Decorators (`common/decorators/`)

| Decorator | Location | Purpose |
|-----------|----------|---------|
| `@CurrentUser()` | `auth/current-user.decorator.ts` | Extract user from request |
| `@Public()` | `auth/public.decorator.ts` | Skip auth guard |
| `@CheckAbilities()` | `authorization/check-abilities.decorator.ts` | Declare required permissions |
| `@Observed()` | `observed.decorator.ts` | Enable observability logging |

---

## 12. Guards (`common/guards/`)

| Guard | Location | Purpose |
|-------|----------|---------|
| `JwtAuthGuard` | `auth/jwt-auth.guard.ts` | Validate JWT access token |
| `AbilitiesGuard` | `authorization/abilities.guard.ts` | Enforce CASL permissions |

---

## 13. Strategies (`common/strategies/`)

| Strategy | Purpose |
|----------|---------|
| `JwtStrategy` | Passport JWT validation, extracts payload |

---

## 14. Services (`common/services/`)

| Service | Purpose |
|---------|---------|
| `EmailService` | Send emails via `@nestjs/mail` |
| `OtpCacheService` | Redis OTP storage/retrieval |
| `OtpCredentialService` | OTP verification with rate limiting |
| `AbilityFactory` | Build CASL abilities from user roles |

---

## Import Patterns

```typescript
// Feature module importing common modules
import {
  AuthenticationModule,
  AuthorizationModule,
  ObservabilityModule,
} from '@/common/modules';

@Module({
  imports: [
    AuthenticationModule,
    AuthorizationModule,
    ObservabilityModule,
  ],
})
export class MyFeatureModule {}

// Service using common services
import { LoggerService } from '@/common/modules/observability/logging';
import { TransactionService } from '@/common/database/transaction';
import { EmailService } from '@/common/services/email';

@Injectable()
export class MyService {
  constructor(
    private readonly logger: LoggerService,
    private readonly tx: TransactionService,
    private readonly email: EmailService,
  ) {}
}
```