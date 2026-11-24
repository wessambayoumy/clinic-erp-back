# Testing Documentation

## Overview

The project uses **Jest** with **SWC** for fast TypeScript compilation. Tests are organized in three layers: unit, integration, and end-to-end (e2e).

## Test Structure

```
test/
├── unit/           # Pure unit tests (isolated, fast)
├── integration/    # Module integration tests (with TestModule)
├── e2e/            # Full HTTP endpoint tests (real app)
├── jest-e2e.json   # E2E Jest config
├── setup.ts        # Global test setup
└── fixtures/       # Test data factories
```

## Running Tests

```bash
# Unit tests only
bun run test --testPathPattern=unit

# Integration tests
bun run test --testPathPattern=integration

# E2E tests
bun run test:e2e

# All tests with coverage
bun run test:cov

# Watch mode
bun run test:watch

# Debug mode
bun run test:debug
```

## Configuration

### Jest Config (package.json)

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "@swc/jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### E2E Config (test/jest-e2e.json)

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "@swc/jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
}
```

---

## Unit Tests

**Purpose:** Test pure functions, services with mocked dependencies.

### Service Unit Test

```typescript
// test/unit/patients/patients.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from '@/features/patients/patients.service';
import { PatientRepository } from '@/features/patients/patients.repository';
import { TransactionService } from '@/common/database/transaction/transaction.service';
import { mockPrisma, mockTransactionService } from '@/test/mocks';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: jest.Mocked<PatientRepository>;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PatientRepository, useValue: mockRepository },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();

    service = module.get(PatientsService);
    repository = module.get(PatientRepository);
    transactionService = module.get(TransactionService);
  });

  describe('createPatient', () => {
    it('should create patient and emit event', async () => {
      const dto = createPatientDto();
      const patient = createPatientEntity({ ...dto, id: 'patient-1' });

      transactionService.run.mockImplementation(async (cb) => cb(mockPrisma));
      repository.create.mockResolvedValue(patient);

      const result = await service.createPatient(dto);

      expect(transactionService.run).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(mockPrisma, dto);
      expect(result).toEqual(patient);
    });
  });
});
```

### Mock Factories

```typescript
// test/mocks/patient.mock.ts
export const createPatientDto = (overrides = {}) => ({
  mrn: 'MRN001',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: new Date('1990-01-01'),
  sex: PatientSex.MALE,
  ...overrides,
});

export const createPatientEntity = (overrides = {}) => ({
  id: 'patient-uuid',
  organizationId: 'org-uuid',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...createPatientDto(overrides),
});
```

---

## Integration Tests

**Purpose:** Test module wiring, real dependencies (Prisma, Redis) with test containers.

### Module Integration Test

```typescript
// test/integration/patients/patients.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PatientsModule } from '@/features/patients/patients.module';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { RLSModule } from '@/common/database/rls/rls.module';
import { setupTestDb, teardownTestDb } from '@/test/setup';

describe('PatientsModule (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;

  beforeAll(async () => {
    await setupTestDb();

    module = await Test.createTestingModule({
      imports: [PatientsModule, PrismaModule, RLSModule],
    }).compile();

    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    await module.close();
    await teardownTestDb();
  });

  it('should resolve PatientsService', () => {
    const service = module.get(PatientsService);
    expect(service).toBeDefined();
  });

  it('should create and find patient', async () => {
    const service = module.get(PatientsService);
    const dto = createPatientDto();

    const patient = await service.createPatient(dto);
    expect(patient.id).toBeDefined();

    const found = await service.getPatient(patient.id);
    expect(found.mrn).toBe(dto.mrn);
  });
});
```

### Test Database Setup

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export async function setupTestDb() {
  prisma = new PrismaClient({
    datasources: { db: { url: process.env.TEST_DATABASE_URL } },
  });

  await prisma.$connect();
  await prisma.$executeRaw`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`;
  await prisma.migrate.deploy();
}

export async function teardownTestDb() {
  await prisma.$disconnect();
}
```

---

## E2E Tests

**Purpose:** Test full HTTP request/response cycle with real Fastify server.

### E2E Test Structure

```typescript
// test/e2e/auth/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDb, teardownTestDb } from '@/test/setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    await setupTestDb();

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await module.close();
    await teardownTestDb();
  });

  describe('POST /api/auth/request-otp', () => {
    it('should return 201 for valid email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/request-otp')
        .send({ email: 'test@example.com' })
        .expect(201);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/request-otp')
        .send({ email: 'invalid' })
        .expect(400);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should return tokens for valid OTP', async () => {
      // Request OTP
      await request(app.getHttpServer())
        .post('/api/auth/request-otp')
        .send({ email: 'test@example.com' })
        .expect(201);

      // Get OTP from file transport (dev)
      const code = await getOtpFromFile('test@example.com');

      const res = await request(app.getHttpServer())
        .post('/api/auth/verify-otp')
        .send({ email: 'test@example.com', code })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });
  });
});
```

### Test Helpers

```typescript
// test/helpers/auth.helper.ts
export async function getValidAccessToken(app: INestApplication, email: string) {
  await request(app.getHttpServer())
    .post('/api/auth/request-otp')
    .send({ email });

  const code = await getOtpFromFile(email);

  const res = await request(app.getHttpServer())
    .post('/api/auth/verify-otp')
    .send({ email, code });

  return res.body.accessToken;
}

export async function authenticatedRequest(
  app: INestApplication,
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
  body?: any,
) {
  const token = await getValidAccessToken(app, 'test@example.com');
  return request(app.getHttpServer())[method](path)
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}
```

---

## Test Utilities

### Custom Matchers

```typescript
// test/matchers/custom.matchers.ts
expect.extend({
  toBeValidUuid(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return {
      pass: uuidRegex.test(received),
      message: () => `expected ${received} to be a valid UUID`,
    };
  },

  toHaveValidTimestamp(received: string) {
    const date = new Date(received);
    return {
      pass: !isNaN(date.getTime()),
      message: () => `expected ${received} to be a valid ISO timestamp`,
    };
  },
});
```

### Database Helpers

```typescript
// test/helpers/db.helper.ts
export async function cleanDatabase(prisma: PrismaClient) {
  const models = Object.keys(prisma).filter(
    (k) => typeof prisma[k] === 'object' && k !== '$connect' && k !== '$disconnect',
  );

  for (const model of models) {
    if (typeof prisma[model].deleteMany === 'function') {
      await prisma[model].deleteMany();
    }
  }
}

export async function seedTestData(prisma: PrismaClient) {
  const org = await prisma.organization.create({
    data: { name: 'Test Org', slug: 'test-org' },
  });

  const location = await prisma.location.create({
    data: { organizationId: org.id, name: 'Main' },
  });

  const passwordHash = await argon2.hash('password123');
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      emailVerified: true,
      staff: {
        create: {
          organizationId: org.id,
          locationId: location.id,
          role: 'OWNER',
          firstName: 'Test',
          lastName: 'User',
        },
      },
    },
  });

  return { org, location, user };
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: clinic_erp_test
        ports: [5432:5432]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports: [6379:6379]

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Generate Prisma client
        run: bun run prisma generate

      - name: Run migrations
        run: bun run prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/clinic_erp_test

      - name: Run unit tests
        run: bun run test --testPathPattern=unit

      - name: Run integration tests
        run: bun run test --testPathPattern=integration
        env:
          TEST_DATABASE_URL: postgresql://test:test@localhost:5432/clinic_erp_test

      - name: Run e2e tests
        run: bun run test:e2e
        env:
          TEST_DATABASE_URL: postgresql://test:test@localhost:5432/clinic_erp_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Best Practices

| Practice | Description |
|----------|-------------|
| **Arrange-Act-Assert** | Structure tests clearly |
| **One assertion per test** | Easier debugging |
| **Descriptive names** | `should return 404 when patient not found` |
| **Mock at module boundary** | Mock repositories, not Prisma directly |
| **Use factories** | Consistent test data |
| **Clean up** | `afterAll` closes connections |
| **Parallel-safe** | No shared state between tests |
| **Fast feedback** | Unit < Integration < E2E |

---

## Coverage Targets

| Layer | Target |
|-------|--------|
| Unit | 80%+ |
| Integration | 60%+ |
| E2E | Critical paths only |

```bash
# View coverage report
bun run test:cov
open coverage/lcov-report/index.html
```

---

## Debugging Tests

```bash
# Debug specific test
bun run test:debug --testNamePattern="should create patient"

# Verbose output
bun run test --verbose

# Run single file
bun run test patients.service.spec.ts
```