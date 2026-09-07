# Clinic ERP Project Structure

This document records the current directory layout of the Clinic ERP backend. The project is organized as a NestJS application with shared capabilities under `src/common`, infrastructure adapters under `src/infrastructure`, and business bounded contexts under `src/modules`.

## Architecture Overview

- `prisma/` - Prisma schema, migrations, and row-level security scripts.
- `src/common/` - Shared cross-cutting concerns used by multiple modules.
- `src/config/` - Application and infrastructure configuration.
- `src/infrastructure/` - External systems, persistence, queues, Redis, and storage adapters.
- `src/modules/` - Business domains organized by application, domain, infrastructure, and presentation layers.
- `test/` - End-to-end, integration, and unit test suites.

## Directory Tree

```text
.
├── prisma/
│   ├── migrations/
│   └── rls/
├── src/
│   ├── common/
│   │   ├── audit/
│   │   ├── auth/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interfaces/
│   │   │   └── strategies/
│   │   ├── authorization/
│   │   │   ├── casl/
│   │   │   ├── decorators/
│   │   │   └── guards/
│   │   ├── database/
│   │   │   ├── rls/
│   │   │   └── transaction/
│   │   ├── events/
│   │   ├── health/
│   │   │   └── indicators/
│   │   ├── http/
│   │   │   ├── decorators/
│   │   │   ├── interceptors/
│   │   │   ├── middleware/
│   │   │   └── pipes/
│   │   └── observability/
│   │       ├── logging/
│   │       ├── metrics/
│   │       └── tracing/
│   ├── config/
│   ├── infrastructure/
│   │   ├── bullmq/
│   │   │   ├── processors/
│   │   │   └── queues/
│   │   ├── database/
│   │   │   └── prisma/
│   │   ├── external/
│   │   │   ├── dicom/
│   │   │   ├── email/
│   │   │   ├── insurance/
│   │   │   ├── payments/
│   │   │   └── sms/
│   │   ├── redis/
│   │   └── storage/
│   │       └── s3/
│   └── modules/
│       ├── billing/
│       │   ├── application/
│       │   ├── domain/
│       │   ├── infrastructure/
│       │   └── presentation/
│       ├── clinical-workflows/
│       │   ├── application/
│       │   ├── domain/
│       │   ├── infrastructure/
│       │   │   └── schema-engine/
│       │   └── presentation/
│       ├── encounters/
│       │   ├── application/
│       │   ├── domain/
│       │   ├── infrastructure/
│       │   └── presentation/
│       ├── identity/
│       │   ├── application/
│       │   │   ├── commands/
│       │   │   ├── dto/
│       │   │   └── queries/
│       │   ├── domain/
│       │   │   ├── entities/
│       │   │   ├── events/
│       │   │   ├── exceptions/
│       │   │   ├── repositories/
│       │   │   ├── services/
│       │   │   └── value-objects/
│       │   ├── infrastructure/
│       │   │   └── persistence/
│       │   │       └── prisma/
│       │   └── presentation/
│       │       └── http/
│       │           ├── controllers/
│       │           └── dto/
│       ├── inventory/
│       │   ├── application/
│       │   ├── domain/
│       │   ├── infrastructure/
│       │   └── presentation/
│       ├── organization/
│       │   ├── application/
│       │   │   ├── commands/
│       │   │   ├── dto/
│       │   │   └── queries/
│       │   ├── domain/
│       │   │   ├── entities/
│       │   │   ├── events/
│       │   │   ├── exceptions/
│       │   │   ├── repositories/
│       │   │   ├── services/
│       │   │   └── value-objects/
│       │   ├── infrastructure/
│       │   │   └── persistence/
│       │   │       └── prisma/
│       │   └── presentation/
│       │       └── http/
│       │           ├── controllers/
│       │           └── dto/
│       ├── patients/
│       │   ├── application/
│       │   │   ├── commands/
│       │   │   ├── dto/
│       │   │   └── queries/
│       │   ├── domain/
│       │   │   ├── entities/
│       │   │   ├── events/
│       │   │   ├── exceptions/
│       │   │   ├── repositories/
│       │   │   ├── services/
│       │   │   └── value-objects/
│       │   ├── infrastructure/
│       │   │   └── persistence/
│       │   │       └── prisma/
│       │   └── presentation/
│       │       └── http/
│       │           ├── controllers/
│       │           └── dto/
│       └── scheduling/
│           ├── application/
│           ├── domain/
│           ├── infrastructure/
│           └── presentation/
└── test/
    ├── e2e/
    ├── integeration/
    └── unit/
```

## Module Layer Responsibilities

- `application/` - Use cases, commands, queries, and application DTOs.
- `domain/` - Entities, value objects, domain events, repositories, and business rules.
- `infrastructure/` - Database implementations and integrations with external systems.
- `presentation/` - HTTP controllers, request DTOs, and transport-specific concerns.

Each directory can own an `index.ts` barrel for exports, following the repository conventions in `ai.instructions.md`.
