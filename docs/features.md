# Features Documentation

## Overview

The system contains **9 business features** organized under `src/features/`. Each feature follows a consistent structure with clear separation of HTTP, business logic, and data access layers.

## Feature Structure

```
features/<feature>/
├── <feature>.controller.ts    # HTTP endpoints
├── <feature>.service.ts       # Business logic
├── <feature>.repository.ts    # Data access (extends BaseRepository)
├── <feature>.module.ts        # DI wiring
├── dtos/                      # Feature-local DTOs
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── index.ts
└── index.ts                   # Public exports
```

---

## 1. Auth Feature (`features/auth/`)

**Purpose:** Registration, email OTP sign-in, password recovery, token management

### Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/auth/register` | `@Public()` | Register new account |
| POST | `/auth/request-otp` | `@Public()` | Request email OTP |
| POST | `/auth/verify-otp` | `@Public()` | Verify OTP, return tokens |
| POST | `/auth/verify-email` | `@Public()` | Verify registration email |
| POST | `/auth/forgot-password` | `@Public()` | Request password reset |
| POST | `/auth/reset-password` | `@Public()` | Reset password with token |
| POST | `/auth/refresh` | `JwtAuthGuard` (refresh) | Rotate access/refresh tokens |
| POST | `/auth/logout` | `JwtAuthGuard` | Revoke refresh token |
| GET | `/auth/me` | `JwtAuthGuard` | Current user profile |

### DTOs

```typescript
// dtos/register.dto.ts
export class RegisterDto {
  @IsEmail() email: string;
  @MinLength(8) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() organizationSlug?: string;
}

// dtos/request-otp.dto.ts
export class RequestOtpDto {
  @IsEmail() email: string;
}

// dtos/verify-otp.dto.ts
export class VerifyOtpDto {
  @IsEmail() email: string;
  @IsString() @Length(6, 6) code: string;
}
```

### Service Methods

```typescript
// auth.service.ts
async register(dto: RegisterDto): Promise<{ userId: string }>
async requestOtp(dto: RequestOtpDto): Promise<{ success: boolean }>
async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokensDto>
async verifyEmail(userId: string, code: string): Promise<AuthTokensDto>
async forgotPassword(email: string): Promise<{ success: boolean }>
async resetPassword(token: string, password: string): Promise<{ success: boolean }>
async refreshTokens(refreshToken: string): Promise<AuthTokensDto>
async logout(userId: string, refreshToken: string): Promise<{ success: boolean }>
async getProfile(userId: string): Promise<UserProfileDto>
```

---

## 2. Identity Feature (`features/identity/`)

**Purpose:** Tenants, locations, staff, users, roles

### Endpoints

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/identity/organizations` | `JwtAuthGuard` + `AbilitiesGuard` | Create organization |
| GET | `/identity/organizations` | `JwtAuthGuard` | List organizations |
| GET | `/identity/organizations/:id` | `JwtAuthGuard` | Get organization |
| PATCH | `/identity/organizations/:id` | `JwtAuthGuard` + `AbilitiesGuard` | Update organization |
| POST | `/identity/locations` | `JwtAuthGuard` + `AbilitiesGuard` | Create location |
| GET | `/identity/locations` | `JwtAuthGuard` | List locations |
| POST | `/identity/staff` | `JwtAuthGuard` + `AbilitiesGuard` | Invite staff |
| GET | `/identity/staff` | `JwtAuthGuard` | List staff |
| PATCH | `/identity/staff/:id` | `JwtAuthGuard` + `AbilitiesGuard` | Update staff |
| DELETE | `/identity/staff/:id` | `JwtAuthGuard` + `AbilitiesGuard` | Deactivate staff |

### Key Entities

```typescript
// Organization
{ id, name, slug, settings, createdAt }

// Location
{ id, organizationId, name, address, phone, isActive }

// Staff
{ id, userId, organizationId, locationId, role, firstName, lastName, isActive }
```

---

## 3. Organization Feature (`features/organization/`)

**Purpose:** Organization hierarchy, settings, branding

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/organization/settings` | Get organization settings |
| PATCH | `/organization/settings` | Update settings |
| GET | `/organization/billing` | Get billing configuration |
| PATCH | `/organization/billing` | Update billing config |

---

## 4. Patients Feature (`features/patients/`)

**Purpose:** Patient demographics, charts, clinical data management

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/patients` | Create patient |
| GET | `/patients` | List patients (paginated, searchable) |
| GET | `/patients/:id` | Get patient chart |
| PATCH | `/patients/:id` | Update patient |
| DELETE | `/patients/:id` | Soft delete patient |
| GET | `/patients/search` | Search patients |
| POST | `/patients/duplicates/check` | Check for duplicates |
| POST | `/patients/:id/merge` | Merge patient charts |

### Clinical Sub-resources

| Method | Path | Description |
|--------|------|-------------|
| GET | `/patients/:id/allergies` | List allergies |
| POST | `/patients/:id/allergies` | Add allergy |
| PATCH | `/patients/:id/allergies/:allergyId` | Update allergy |
| DELETE | `/patients/:id/allergies/:allergyId` | Remove allergy |
| GET | `/patients/:id/medications` | List medications |
| GET | `/patients/:id/histories` | List medical histories |
| GET | `/patients/:id/documents` | List documents |
| POST | `/patients/:id/documents` | Upload document |
| GET | `/patients/:id/documents/:docId` | Download document |
| DELETE | `/patients/:id/documents/:docId` | Delete document |

### DTOs

```typescript
// dtos/create-patient.dto.ts
export class CreatePatientDto {
  @IsString() mrn: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsDate() @Type(() => Date) dateOfBirth: Date;
  @IsEnum(PatientSex) sex: PatientSex;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @ValidateNested() @Type(() => AddressDto) address?: AddressDto;
}

// dtos/create-allergy.dto.ts
export class CreateAllergyDto {
  @IsString() allergen: string;
  @IsEnum(AllergySeverity) severity: AllergySeverity;
  @IsOptional() @IsString() reaction?: string;
  @IsOptional() @IsDate() @Type(() => Date) onsetDate?: Date;
}
```

---

## 5. Scheduling Feature (`features/scheduling/`)

**Purpose:** Appointments, provider schedules, slots, waitlists

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scheduling/appointments` | Book appointment |
| GET | `/scheduling/appointments` | List appointments |
| GET | `/scheduling/appointments/:id` | Get appointment |
| PATCH | `/scheduling/appointments/:id` | Update appointment |
| POST | `/scheduling/appointments/:id/cancel` | Cancel appointment |
| POST | `/scheduling/appointments/:id/reschedule` | Reschedule |
| GET | `/scheduling/providers/:id/schedule` | Get provider schedule |
| POST | `/scheduling/providers/:id/schedule` | Create schedule block |
| GET | `/scheduling/slots` | Get available slots |
| POST | `/scheduling/waitlist` | Join waitlist |
| GET | `/scheduling/waitlist` | Get waitlist |

### Key Concepts

- **Schedule Blocks**: Recurring or one-time provider availability
- **Slots**: Individual appointment time windows derived from blocks
- **Waitlist**: Patients notified when slots open

---

## 6. Encounters Feature (`features/encounters/`)

**Purpose:** Clinical encounters, notes, diagnoses

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/encounters` | Start encounter |
| GET | `/encounters` | List encounters |
| GET | `/encounters/:id` | Get encounter |
| PATCH | `/encounters/:id` | Update encounter |
| POST | `/encounters/:id/complete` | Complete encounter |
| GET | `/encounters/:id/notes` | List clinical notes |
| POST | `/encounters/:id/notes` | Add clinical note |
| GET | `/encounters/:id/diagnoses` | List diagnoses |
| POST | `/encounters/:id/diagnoses` | Add diagnosis |

### Encounter Types

```typescript
enum EncounterType {
  OFFICE_VISIT = 'OFFICE_VISIT',
  TELEHEALTH = 'TELEHEALTH',
  EMERGENCY = 'EMERGENCY',
  INPATIENT = 'INPATIENT',
  PROCEDURE = 'PROCEDURE',
}

enum EncounterStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}
```

---

## 7. Clinical Workflows Feature (`features/clinical-workflows/`)

**Purpose:** Custom forms, schema engine, orders, results

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/clinical-workflows/forms` | Create form schema |
| GET | `/clinical-workflows/forms` | List form schemas |
| GET | `/clinical-workflows/forms/:id` | Get form schema |
| POST | `/clinical-workflows/forms/:id/submit` | Submit form response |
| GET | `/clinical-workflows/orders` | List orders |
| POST | `/clinical-workflows/orders` | Create order |
| PATCH | `/clinical-workflows/orders/:id` | Update order |
| GET | `/clinical-workflows/results` | List results |
| POST | `/clinical-workflows/results` | Record result |

### Schema Engine

Dynamic form schema with validation:

```json
{
  "name": "Annual Wellness Visit",
  "version": 1,
  "fields": [
    { "key": "bp_systolic", "type": "number", "label": "Systolic BP", "required": true },
    { "key": "bp_diastolic", "type": "number", "label": "Diastolic BP", "required": true },
    { "key": "weight_kg", "type": "number", "label": "Weight (kg)" },
    { "key": "smoking_status", "type": "select", "options": ["never", "former", "current"] }
  ]
}
```

---

## 8. Billing Feature (`features/billing/`)

**Purpose:** Invoicing, payments, insurance claims, adjustments

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/billing/invoices` | Create invoice |
| GET | `/billing/invoices` | List invoices |
| GET | `/billing/invoices/:id` | Get invoice |
| POST | `/billing/invoices/:id/finalize` | Finalize invoice |
| POST | `/billing/invoices/:id/payments` | Record payment |
| GET | `/billing/claims` | List insurance claims |
| POST | `/billing/claims` | Submit claim |
| PATCH | `/billing/claims/:id` | Update claim status |
| POST | `/billing/adjustments` | Create adjustment |

### Invoice Status Flow

```
DRAFT → FINALIZED → SENT → PARTIALLY_PAID → PAID
                    ↘ CANCELLED
                    ↘ REFUNDED
```

---

## 9. Inventory Feature (`features/inventory/`)

**Purpose:** Stock tracking, suppliers, purchase orders, lot/expiry management

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/inventory/items` | Create inventory item |
| GET | `/inventory/items` | List items |
| GET | `/inventory/items/:id` | Get item |
| PATCH | `/inventory/items/:id` | Update item |
| GET | `/inventory/stock` | Get stock levels |
| POST | `/inventory/stock/adjust` | Adjust stock |
| POST | `/inventory/suppliers` | Create supplier |
| GET | `/inventory/suppliers` | List suppliers |
| POST | `/inventory/purchase-orders` | Create PO |
| GET | `/inventory/purchase-orders` | List POs |
| POST | `/inventory/purchase-orders/:id/receive` | Receive PO |

### Lot Tracking

```typescript
interface LotInfo {
  lotNumber: string;
  expiryDate: Date;
  quantity: number;
  supplierId: string;
}
```

---

## Common Patterns

### Controller Template

```typescript
@Controller('patients')
@UseGuards(JwtAuthGuard, AbilitiesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @CheckAbilities({ action: 'create', subject: 'Patient' })
  async create(@Body() dto: CreatePatientDto) {
    return this.patientsService.createPatient(dto);
  }

  @Get()
  @CheckAbilities({ action: 'read', subject: 'Patient' })
  async list(@Query() query: ListPatientsQueryDto) {
    return this.patientsService.listPatients(query);
  }
}
```

### Service Template

```typescript
@Injectable()
export class PatientsService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly patientRepository: PatientRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPatient(dto: CreatePatientDto): Promise<PatientEntity> {
    return this.transactionService.run(async (tx) => {
      const patient = await this.patientRepository.create(tx, dto);
      this.eventEmitter.emit(new PatientCreatedEvent(patient));
      return patient;
    });
  }
}
```

### Repository Template

```typescript
@Injectable()
export class PatientRepository extends BaseRepository<Patient, CreatePatientDto, UpdatePatientDto> {
  constructor(prisma: PrismaService) {
    super(prisma.client, 'patient');
  }

  async findByMrn(tx: PrismaTransaction, organizationId: string, mrn: string): Promise<Patient | null> {
    return tx.patient.findFirst({
      where: { organizationId, mrn, deletedAt: null },
    });
  }
}
```

---

## Feature Dependencies

| Feature | Depends On |
|---------|------------|
| auth | identity, security, email, bullmq, redis |
| identity | organization |
| organization | - |
| patients | identity, organization |
| scheduling | patients, identity |
| encounters | patients, scheduling |
| clinical-workflows | patients, encounters |
| billing | patients, encounters, organization |
| inventory | organization |

---

## Adding a New Feature

1. Create `features/new-feature/` with standard structure
2. Add DTOs to `common/dtos/new-feature/`
3. Add interfaces to `common/interfaces/new-feature/`
4. Add enums to `shared/enums/new-feature/`
5. Add repository to `common/database/repositories/new-feature/`
6. Create module and register in `FeaturesModule`
7. Add RLS policies for new tables
8. Write tests