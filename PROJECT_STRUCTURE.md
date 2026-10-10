# Clinic ERP Project Structure

This document records the current directory layout of the Clinic ERP backend after the `common/` and `features/` refactor. `modules/` was renamed to `features/`, `infrastructure/` was renamed to `core/`, and `common/` was reorganized to be type-first: every cross-cutting artifact (dtos, interfaces, enums, events, exceptions, repositories, decorators, guards, strategies, services) lives under `common/<type>/<domain>/`, with the domain being either a business feature (`patients`, `billing`, ...) or a cross-cutting concern (`auth`, `authorization`).

## Architecture Overview

- `prisma/` - Prisma schema, migrations, and row-level security scripts.
- `src/common/` - All shared contracts and cross-cutting logic, organized by type first, domain second.
- `src/config/` - Application and core configuration.
- `src/core/` - External systems, persistence, queues, Redis, and storage adapters.
- `src/features/` - Business domains. Each feature holds only a controller, service(s), module, and entities — no local dtos, interfaces, enums, events, exceptions, or repositories.
- `test/` - End-to-end, integration, and unit test suites.

## Directory Tree

```text
.
├── src/
│   ├── common/
│     ├── events/<domain>/
│     ├── exceptions/<domain>/
│     ├── decorators/<domain>/        (auth/, authorization/)
│     ├── guards/<domain>/            (auth/, authorization/)
│     ├── strategies/<domain>/        (auth/)
│     ├── services/<domain>/          (authorization/ → AbilityFactory)
│     ├── interceptors/
│     ├── pipes/
│     ├── filters/
│     ├── database/
|     |   ├── repositories/<domain>/<domain>.repository.ts
|     |   ├── ....
│     ├── health/
│     ├── http/
│     ├── observability/
│     └── index.ts
|   ├── shared/
│        ├── enums/<domain>/
│        |── dtos/<domain>/
│        ├── interfaces/<domain>/
│        ├── types/
│        ├── config/
|        └── index.ts
│   ├── core/
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
│   └── features/
│       ├── billing/
│       │   ├── billing.controller.ts
│       │   ├── billing.service.ts
│       │   ├── billing.module.ts
│       │   └── index.ts
│       ├── clinical-workflows/
│       │   ├── clinical-workflows.controller.ts
│       │   ├── clinical-workflows.service.ts     ← includes former schema-engine logic
│       │   ├── clinical-workflows.module.ts
│       │   └── index.ts
│       ├── encounters/
│       │   ├── encounters.controller.ts
│       │   ├── encounters.service.ts
│       │   ├── encounters.module.ts
│       │   └── index.ts
│       ├── identity/
│       │   ├── identity.controller.ts
│       │   ├── identity.service.ts
│       │   ├── identity.module.ts
│       │   └── index.ts
│       ├── inventory/
│       │   ├── inventory.controller.ts
│       │   ├── inventory.service.ts
│       │   ├── inventory.module.ts
│       │   └── index.ts
│       ├── organization/
│       │   ├── organization.controller.ts
│       │   ├── organization.service.ts
│       │   ├── organization.module.ts
│       │   └── index.ts
│       ├── patients/
│       │   ├── patients.controller.ts
│       │   ├── patients.service.ts
│       │   ├── patients.module.ts
│       │   └── index.ts
│       └── scheduling/
│           ├── <>.entity.ts
│           ├── scheduling.controller.ts
│           ├── scheduling.service.ts
│           ├── scheduling.module.ts
│           └── index.ts
└── test/
    ├── e2e/
    ├── integeration/
    └── unit/
```

## `common/` Type Folder Responsibilities

- `dtos/` - Request/response DTOs, one subfolder per feature, `class-validator` decorated.
- `interfaces/` - `I`-prefixed contracts, one subfolder per feature plus `auth/` and `authorization/`.
- `enums/` - Closed value sets, `Enum`-suffixed, one subfolder per feature.
- `events/` - Domain event classes, one subfolder per feature.
- `exceptions/` - Custom exception classes, one subfolder per feature.
- `repositories/` - Full Prisma repository implementations, one file per feature. This is the one place `common/` depends on `core/database/prisma`.
- `decorators/` - Cross-cutting decorators, split into `auth/` and `authorization/`.
- `guards/` - Cross-cutting guards, split into `auth/` and `authorization/`.
- `strategies/` - Passport strategies (`auth/jwt.strategy.ts`).
- `services/` - Cross-cutting service classes that aren't a simple contract, e.g. CASL's `AbilityFactory` under `authorization/`.
- `interceptors/`, `pipes/`, `filters/` - Global request-lifecycle pieces (logging, request context, validation, exception mapping).
- `database/`, `health/`, `http/`, `observability/` - Unchanged infrastructure-support folders, not yet broken down further.

## `features/<feature>/` Responsibilities

- `entities/` - The domain entity for this feature. The only feature-owned "type."
- `<feature>.controller.ts` - HTTP layer. Accepts DTOs from `common/dtos/<feature>`, calls the service, returns DTOs.
- `<feature>.service.ts` - Orchestration and business rules. Injects the repository from `common/repositories/<feature>` rather than talking to Prisma directly. Can be split into multiple `*.service.ts` files if one feature has distinct concerns.
- `<feature>.module.ts` - DI wiring for the above three.

## Status Notes Carried Over

- `audit/` was removed entirely — no replacement currently planned.
- The eight business features are `identity`, `organization`, `patients`, `billing`, `clinical-workflows`, `encounters`, `inventory`, `scheduling`.
- This is a structural document only; it does not reflect the RLS/Prisma/CASL implementation bugs tracked separately in project state notes.
