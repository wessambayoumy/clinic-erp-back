# Database Documentation

## Overview

PostgreSQL 15+ with **Prisma ORM 8** and **Row-Level Security (RLS)** for multi-tenant isolation. All tenant-scoped queries are automatically filtered by RLS policies based on session variables set per transaction.

## Prisma Schema

### Core Models

```prisma
// prisma/schema.prisma (key models)

model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  locations   Location[]
  staff       Staff[]
  patients    Patient[]
}

model Location {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  name           String
  address        Json?
  phone          String?
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?

  staff          Staff[]
  patients       Patient[]
  appointments   Appointment[]
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  staff         Staff?
  refreshTokens RefreshToken[]
}

model Staff {
  id             String       @id @default(uuid())
  userId         String       @unique
  user           User         @relation(fields: [userId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  locationId     String?
  location       Location?    @relation(fields: [locationId], references: [id])
  role           StaffRole    @default(STAFF)
  firstName      String
  lastName       String
  phone          String?
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?

  appointments   Appointment[]
}

model Patient {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  locationId     String?
  location       Location?    @relation(fields: [locationId], references: [id])
  mrn            String       // Medical Record Number
  firstName      String
  lastName       String
  dateOfBirth    DateTime
  sex            PatientSex
  phone          String?
  email          String?
  address        Json?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?

  @@unique([organizationId, mrn])
  @@index([organizationId, lastName, firstName])

  allergies      PatientAllergy[]
  medications    PatientMedication[]
  histories      MedicalHistory[]
  documents      PatientDocument[]
  encounters     Encounter[]
  appointments   Appointment[]
}

enum StaffRole {
  OWNER
  ADMIN
  PHYSICIAN
  NURSE
  STAFF
  BILLING
}

enum PatientSex {
  MALE
  FEMALE
  OTHER
  UNKNOWN
}
```

### Clinical Models

```prisma
model Encounter {
  id             String         @id @default(uuid())
  organizationId String
  patientId      String
  patient        Patient        @relation(fields: [patientId], references: [id])
  locationId     String
  providerId     String
  staff          Staff          @relation(fields: [providerId], references: [id])
  type           EncounterType
  status         EncounterStatus @default(PLANNED)
  startedAt      DateTime?
  endedAt        DateTime?
  chiefComplaint String?
  notes          Json?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?

  @@index([organizationId, patientId, startedAt])
}

enum EncounterType {
  OFFICE_VISIT
  TELEHEALTH
  EMERGENCY
  INPATIENT
  PROCEDURE
}

enum EncounterStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Billing & Inventory Models

```prisma
model Invoice {
  id             String         @id @default(uuid())
  organizationId String
  patientId      String
  patient        Patient        @relation(fields: [patientId], references: [id])
  encounterId    String?
  encounter      Encounter?     @relation(fields: [encounterId], references: [id])
  number         String         // Human-readable invoice number
  status         InvoiceStatus  @default(DRAFT)
  subtotal       Decimal        @db.Decimal(12, 2)
  tax            Decimal        @db.Decimal(12, 2)
  total          Decimal        @db.Decimal(12, 2)
  balance        Decimal        @db.Decimal(12, 2)
  issuedAt       DateTime?
  dueAt          DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  deletedAt      DateTime?

  @@unique([organizationId, number])
  @@index([organizationId, patientId, status])

  lineItems      InvoiceLineItem[]
  payments       Payment[]
}

model InventoryItem {
  id             String   @id @default(uuid())
  organizationId String
  sku            String
  name           String
  description    String?
  category       String
  unitOfMeasure  String
  unitCost       Decimal  @db.Decimal(12, 2)
  sellingPrice   Decimal  @db.Decimal(12, 2)
  reorderLevel   Int      @default(10)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  @@unique([organizationId, sku])
  @@index([organizationId, category])

  stockLevels    StockLevel[]
  purchaseItems  PurchaseOrderItem[]
}

model StockLevel {
  id             String           @id @default(uuid())
  organizationId String
  itemId         String
  item           InventoryItem    @relation(fields: [itemId], references: [id])
  locationId     String
  quantity       Int              @default(0)
  reserved       Int              @default(0)
  updatedAt      DateTime         @updatedAt

  @@unique([organizationId, itemId, locationId])
}
```

## Row-Level Security (RLS)

### Session Variables

Set per transaction by `RLSService.applyContext()`:

```sql
-- Applied via Prisma transaction callback
SET LOCAL app.current_user_id = 'user-uuid';
SET LOCAL app.current_organization_id = 'org-uuid';
SET LOCAL app.current_location_id = 'location-uuid'; -- optional
```

### RLS Policies (Example)

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access patients in their organization
CREATE POLICY patient_org_isolation ON "Patient"
  USING ("organizationId" = current_setting('app.current_organization_id')::uuid);

-- Policy: Location-scoped access (if locationId set)
CREATE POLICY patient_location_isolation ON "Patient"
  USING (
    "locationId" IS NULL OR
    "locationId" = current_setting('app.current_location_id')::uuid
  );

-- Combined policy (organization + optional location)
CREATE POLICY patient_tenant_isolation ON "Patient"
  USING (
    "organizationId" = current_setting('app.current_organization_id')::uuid
    AND (
      "locationId" IS NULL OR
      "locationId" = current_setting('app.current_location_id')::uuid
    )
  );
```

### Tables with RLS

| Table | Organization | Location | Notes |
|-------|-------------|----------|-------|
| `Patient` | ✅ | ✅ | MRN unique per org |
| `Encounter` | ✅ | ✅ | |
| `Appointment` | ✅ | ✅ | |
| `Invoice` | ✅ | ❌ | |
| `InventoryItem` | ✅ | ❌ | |
| `StockLevel` | ✅ | ✅ | |
| `Staff` | ✅ | ✅ | |
| `ClinicalNote` | ✅ | ✅ | |
| `Order` | ✅ | ✅ | |
| `Result` | ✅ | ✅ | |

### RLS Service

```typescript
// common/database/rls/rls.service.ts
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

## Transaction Management

### TransactionService

```typescript
// common/database/transaction/transaction.service.ts
@Observed()
@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rlsService: RLSService,
    private readonly requestContextStorage: RequestContextStorage,
    private readonly logger: LoggerService,
  ) {}

  public async run<T>(callback: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
    const context = this.requestContextStorage.getContext();

    if (!context) {
      throw new Error('TransactionService.run() called outside of a request context');
    }

    return this.prisma.client.$transaction(async (tx) => {
      await this.rlsService.applyContext(tx, {
        userId: context.userId,
        organizationId: context.organizationId,
        locationId: context.locationId,
      });

      try {
        const result = await callback(tx);
        this.logger.debug(`Transaction completed for org: ${context.organizationId}`);
        return result;
      } catch (error) {
        this.logger.error(`Transaction failed: ${error.message}`);
        throw error;
      }
    });
  }
}
```

### Usage in Services

```typescript
// features/patients/patients.service.ts
@Injectable()
export class PatientsService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly patientRepository: PatientRepository,
  ) {}

  async createPatient(dto: CreatePatientDto): Promise<PatientEntity> {
    return this.transactionService.run(async (tx) => {
      return this.patientRepository.create(tx, dto);
    });
  }

  async updatePatient(id: string, dto: UpdatePatientDto): Promise<PatientEntity> {
    return this.transactionService.run(async (tx) => {
      return this.patientRepository.update(tx, id, dto);
    });
  }
}
```

## Repository Pattern

### Base Repository

```typescript
// common/database/repositories/base.repository.ts
export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly modelName: string,
  ) {}

  async create(tx: PrismaTransaction, dto: CreateDto): Promise<T> {
    return tx[this.modelName].create({ data: dto }) as Promise<T>;
  }

  async findById(tx: PrismaTransaction, id: string): Promise<T | null> {
    return tx[this.modelName].findUnique({ where: { id } }) as Promise<T | null>;
  }

  async findMany(tx: PrismaTransaction, args: PrismaFindManyArgs): Promise<T[]> {
    return tx[this.modelName].findMany(args) as Promise<T[]>;
  }

  async update(tx: PrismaTransaction, id: string, dto: UpdateDto): Promise<T> {
    return tx[this.modelName].update({ where: { id }, data: dto }) as Promise<T>;
  }

  async delete(tx: PrismaTransaction, id: string): Promise<T> {
    return tx[this.modelName].update({
      where: { id },
      data: { deletedAt: new Date() }, // Soft delete
    }) as Promise<T>;
  }
}
```

### Feature Repository

```typescript
// features/patients/patients.repository.ts
@Injectable()
export class PatientRepository extends BaseRepository<Patient, CreatePatientDto, UpdatePatientDto> {
  constructor(prisma: PrismaService) {
    super(prisma.client, 'patient');
  }

  async searchByName(
    tx: PrismaTransaction,
    organizationId: string,
    query: string,
  ): Promise<Patient[]> {
    return tx.patient.findMany({
      where: {
        organizationId,
        deletedAt: null,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { mrn: { contains: query } },
        ],
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async checkDuplicates(
    tx: PrismaTransaction,
    dto: CheckDuplicatesDto,
  ): Promise<Patient[]> {
    return tx.patient.findMany({
      where: {
        organizationId: dto.organizationId,
        deletedAt: null,
        OR: [
          { firstName: dto.firstName, lastName: dto.lastName, dateOfBirth: dto.dateOfBirth },
          { mrn: dto.mrn },
          { email: dto.email },
        ].filter(Boolean),
      },
    });
  }
}
```

## Prisma Client Configuration

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

    // RLS middleware (runs before every query)
    this.$use(async (params, next) => {
      // Log slow queries
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      if (after - before > 1000) {
        logger.warn(`Slow query: ${params.model}.${params.action} took ${after - before}ms`);
      }
      return result;
    });

    // Soft delete middleware
    this.$use(async (params, next) => {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.args.where = { ...params.args.where, deletedAt: null };
      }
      if (params.action === 'findMany') {
        params.args.where = { ...params.args.where, deletedAt: null };
      }
      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## Migrations

### Creating Migrations

```bash
# Development
bun run prisma migrate dev --name add_patient_allergies

# Production (generate SQL only)
bun run prisma migrate deploy
```

### Migration Structure

```
prisma/migrations/
├── 20241114000000_init/
│   └── migration.sql
├── 20241114000001_add_rls_policies/
│   └── migration.sql
└── migration_lock.toml
```

### RLS Migration Example

```sql
-- 20241114000001_add_rls_policies/migration.sql

-- Enable RLS
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Encounter" ENABLE ROW LEVEL SECURITY;
-- ... other tables

-- Create policies
CREATE POLICY patient_tenant_isolation ON "Patient"
  USING (
    "organizationId" = current_setting('app.current_organization_id')::uuid
    AND ("locationId" IS NULL OR "locationId" = current_setting('app.current_location_id')::uuid)
  );

-- Grant permissions to app role
GRANT SELECT, INSERT, UPDATE, DELETE ON "Patient" TO clinic_app;
```

## Seeding

```bash
bun run prisma db seed
```

```typescript
// prisma/seed.ts
async function main() {
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Clinic',
      slug: 'demo-clinic',
    },
  });

  const location = await prisma.location.create({
    data: {
      organizationId: org.id,
      name: 'Main Campus',
    },
  });

  // Create admin user
  const passwordHash = await argon2.hash('demo123');
  const user = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      emailVerified: true,
      staff: {
        create: {
          organizationId: org.id,
          locationId: location.id,
          role: 'OWNER',
          firstName: 'Admin',
          lastName: 'User',
        },
      },
    },
  });
}
```

## Performance Optimization

### Indexes

```prisma
model Patient {
  // ... fields
  @@index([organizationId, lastName, firstName])
  @@index([organizationId, dateOfBirth])
  @@index([organizationId, phone])
}
```

### Connection Pooling

```env
# For PgBouncer (transaction pooling)
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/clinic_erp?pgbouncer=true&connection_limit=20"
```

### Query Optimization

- Use `select` to fetch only needed fields
- Leverage `include` for relations (avoids N+1)
- Use `cursor` pagination for large datasets
- Monitor slow queries via Prisma logging

## Backup & Recovery

```bash
# Logical backup
pg_dump -h localhost -U postgres clinic_erp > backup_$(date +%F).sql

# Point-in-time recovery (requires WAL archiving)
pg_basebackup -D /backup/data -Ft -z -P
```

## Testing Database

```typescript
// test/integration/setup.ts
export async function setupTestDb() {
  // Use test database
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/clinic_erp_test';

  // Run migrations
  await prisma.$executeRaw`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`;
  await prisma.migrate.deploy();

  // Seed test data
  await seedTestData();
}
```

## Troubleshooting

### RLS Not Working

1. Verify `RLSService.applyContext()` called inside transaction
2. Check session variables: `SHOW app.current_organization_id;`
3. Ensure policies exist: `\d+ "Patient"` in psql
4. Confirm `SET LOCAL` (not `SET`) for transaction scope

### Prisma Connection Issues

1. Check `DATABASE_URL` format
2. Verify PostgreSQL accepts connections
3. Check PgBouncer config if used
4. Monitor connection pool exhaustion

### Migration Failures

1. Check for conflicting changes
2. Use `prisma migrate diff` to inspect
3. Manually resolve if needed
4. Baseline if schema diverged: `prisma migrate resolve --applied`