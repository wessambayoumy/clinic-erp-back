# Architecture Documentation

## System Overview

Clinic ERP Backend is a **modular monolith** built with NestJS 11, Fastify, Prisma ORM 8, and PostgreSQL. It implements a multi-tenant clinic management system with row-level security (RLS) for tenant isolation at the database level.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
                        HTTP Request
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Fastify Server (main.ts)
  ├── Helmet (security headers)
  ├── Compress (gzip/deflate)
  ├── CORS
  └── Global Prefix (/api)
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Global Middleware (app.module.ts)
  └── RequestIdMiddleware → x-request-id header
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Global Guards (app.module.ts)
  └── ThrottlerGuard (rate limiting: 100 req/min)
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Global Interceptors (app.module.ts)
  ├── RequestContextInterceptor → AsyncLocalStorage context
  ├── ErrorInterceptor → Error normalization
  ├── ResponseInterceptor → Standard response envelope
  └── ObservabilityInterceptor → Request/response logging
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Route Controllers (features/*/controller.ts)
  ├── DTO validation (class-validator)
  ├── Auth guards (JwtAuthGuard, AbilitiesGuard)
  └── Service delegation
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Domain Services (features/*/service.ts)
  ├── Business logic & orchestration
  ├── Repository calls (common/repositories/*)
  ├── Domain events emission
  └── External service integration
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  TransactionService (common/database/transaction/)
  ├── Prisma transaction boundary
  ├── RLS context application (per-transaction)
  └── Automatic commit/rollback
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Repositories (common/database/repositories/)
  ├── Prisma query execution
  ├── RLS-enforced queries
  └── Domain entity mapping
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
  Prisma Client (core/database/prisma/)
  ├── PostgreSQL connection pool
  ├── RLS middleware (SET LOCAL app.current_*)
  └── Query execution
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    PostgreSQL Database (RLS Policies)
```

## Module Dependency Graph

```
AppModule
├── ConfigurationModule (global, first)
├── CoreModules
│   ├── PrismaModule
│   ├── RedisModule
│   ├── BullMQModule
│   └── RLSModule
├── CommonModules
│   ├── AuthenticationModule
│   ├── AuthorizationModule
│   ├── HealthModule
│   ├── ObservabilityModule
│   └── EventsModule
└── FeaturesModule
    ├── AuthModule
    ├── IdentityModule
    ├── OrganizationModule
    ├── PatientsModule
    ├── SchedulingModule
    ├── EncountersModule
    ├── ClinicalWorkflowsModule
    ├── BillingModule
    └── InventoryModule
```

## Key Architectural Patterns

### 1. Type-First Common Layer

All cross-cutting types are organized by **type first, domain second**:

```
common/
├── dtos/<domain>/          # Request/Response DTOs
├── interfaces/<domain>/    # Repository ports, service contracts
├── enums/<domain>/         # Closed value sets
├── events/<domain>/        # Domain events
├── exceptions/<domain>/    # Custom exceptions
├── repositories/<domain>/  # Prisma implementations
├── decorators/<domain>/    # Auth, AuthZ decorators
├── guards/<domain>/        # Auth, AuthZ guards
├── strategies/<domain>/    # Passport strategies
└── services/<domain>/      # Email, AbilityFactory
```

**Benefits:**
- Single source of truth for contracts
- Features import only what they need
- Easy to find related types

### 2. Feature Isolation

Each feature in `features/<name>/` owns only:
- Controller (HTTP layer)
- Service (business logic)
- Module (DI wiring)
- Repository (feature-specific queries)
- Entities (domain models)
- Local DTOs (feature-specific request/response)

Features **do not** contain:
- Shared DTOs/interfaces/enums (import from `common/`)
- Database configuration
- Cross-cutting concerns (logging, auth, etc.)

### 3. Repository Pattern with RLS

```
Service → TransactionService.run() → Repository → Prisma → PostgreSQL (RLS)
```

- `TransactionService` wraps operations in Prisma transactions
- Applies RLS context (`userId`, `organizationId`, `locationId`) **inside** the transaction callback
- Uses `AsyncLocalStorage` (`RequestContextStorage`) to retrieve context from verified JWT
- Fails closed: throws if no request context in scope

### 4. Configuration-Driven Design

- All env vars validated at startup via Zod schema (`config.schema.ts`)
- Typed config access via `ConfigService` with keys in `shared/constants/config.ts`
- Feature modules consume config via `ConfigService.getOrThrow()`

### 5. Event-Driven Communication

Domain events emitted from services:
```typescript
// In service
this.eventEmitter.emit(new UserRegisteredEvent(user));

// In common/events/<domain>/
export class UserRegisteredEvent {
  constructor(public readonly user: UserEntity) {}
}
```

Consumers subscribe via `EventsModule` (currently placeholder for future expansion).

## Data Flow Examples

### Authenticated Request Flow

1. Request hits Fastify with `Authorization: Bearer <accessToken>`
2. `RequestIdMiddleware` adds/forwards `x-request-id`
3. `ThrottlerGuard` checks rate limit
4. `JwtAuthGuard` validates JWT via `JwtStrategy`
5. `RequestContextInterceptor` extracts claims → stores in `AsyncLocalStorage`
6. Controller receives validated DTO, calls service
7. Service calls `TransactionService.run(callback)`
8. `TransactionService` reads context from `AsyncLocalStorage`
9. Opens Prisma transaction, applies RLS via `RLSService.applyContext(tx, context)`
10. Repository executes queries (RLS policies enforce tenant isolation)
11. Service returns domain entity
12. `ResponseInterceptor` wraps in standard envelope: `{ data, meta, timestamp }`
13. `ObservabilityInterceptor` logs request/response
14. `ErrorInterceptor` catches any thrown errors, normalizes to `AppException`

### Background Job Flow (BullMQ)

1. Service enqueues job: `emailQueue.add('send-otp', { email, code })`
2. `EmailNotificationProcessor` picks up job
3. Processor calls `EmailService.sendOtpEmail(email, code)`
4. `EmailService` uses `@nestjs/mail` with configured transport
5. Job marked complete/failed with retry logic

## Security Architecture

### Authentication
- JWT access tokens (15min) + refresh tokens (90d)
- Argon2id password hashing (via `SecurityModule`)
- Email OTP for passwordless sign-in
- Token rotation on refresh

### Authorization (CASL)
- `AbilityFactory` builds permissions from user roles
- `@CheckAbilities()` decorator + `AbilitiesGuard` on controllers
- Permissions defined per feature in `common/services/authorization/`

### Row-Level Security (PostgreSQL)
- RLS policies on all tenant-scoped tables
- `app.current_user_id`, `app.current_organization_id`, `app.current_location_id` session variables
- `RLSService.applyContext()` sets variables per transaction
- Policies enforce `organization_id = current_setting('app.current_organization_id')::uuid`

### Data Protection
- Structured logger redacts sensitive keys (password, token, SSN, DOB, MRN, etc.)
- Helmet security headers
- CORS restricted to configured origins
- Rate limiting via Throttler

## Scalability Considerations

| Component | Scaling Strategy |
|-----------|-----------------|
| HTTP Server | Horizontal (stateless), sticky sessions not needed |
| Prisma/PostgreSQL | Connection pooling (PgBouncer), read replicas for reporting |
| Redis | Cluster mode for BullMQ + caching |
| BullMQ | Multiple workers per queue, priority queues |
| File Storage | S3-compatible (MinIO, AWS S3, Cloudflare R2) |

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Bun / Node.js | 20+ / 1.1+ |
| Framework | NestJS | 11.x |
| HTTP Server | Fastify | 5.x (via `@nestjs/platform-fastify`) |
| ORM | Prisma | 8.0.0-rc.11 |
| Database | PostgreSQL | 15+ |
| Cache/Queue | Redis + BullMQ | 7+ / 6.x |
| Validation | class-validator + class-transformer | 0.14 / 0.5 |
| Config | @nestjs/config + Zod | 4.x / 4.x |
| Auth | @nestjs/jwt + Passport + Argon2 | 11.x / 0.7 / 0.45 |
| Email | @nestjs/mail (nodemailer) | 0.0.2 |
| Logging | Custom JSON logger (ConsoleLogger) | - |
| Testing | Jest + @swc/jest | 30.x / 0.2.39 |
| Linting | ESLint 9 + TypeScript ESLint | 9.x / 8.x |
| Formatting | Prettier | 3.x |

## Directory Conventions

| Convention | Example |
|------------|---------|
| Feature modules | `features/patients/patients.module.ts` |
| Common modules | `common/modules/authentication/authentication.module.ts` |
| Core adapters | `core/database/prisma/prisma.module.ts` |
| Shared types | `shared/interfaces/patients/patient-repository.interface.ts` |
| DTOs | `common/dtos/patients/create-patient.dto.ts` |
| Enums | `shared/enums/patients/patient-status.enum.ts` |
| Events | `common/events/patients/patient-created.event.ts` |
| Exceptions | `common/exceptions/patients/patient-not-found.exception.ts` |
| Repositories | `common/database/repositories/patients/patients.repository.ts` |
| Decorators | `common/decorators/auth/current-user.decorator.ts` |
| Guards | `common/guards/auth/jwt-auth.guard.ts` |
| Strategies | `common/strategies/auth/jwt.strategy.ts` |