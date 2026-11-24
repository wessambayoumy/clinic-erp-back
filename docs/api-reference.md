# API Reference

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.clinic-erp.com/api
```

All endpoints are prefixed with `/api` (configurable via `APP_API_PREFIX`).

## Authentication

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes (except `@Public()`) | `Bearer <access_token>` |
| `Content-Type` | Yes | `application/json` |
| `x-request-id` | No | Client-generated request ID (echoed in response) |

### Token Refresh

When access token expires (401 with `AUTH_TOKEN_EXPIRED`):

```bash
POST /api/auth/refresh
Authorization: Bearer <expired_access_token>
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

Response: New `{ accessToken, refreshToken }` pair.

---

## Standard Response Format

All successful responses:

```json
{
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-11-14T10:30:00.000Z"
  },
  "timestamp": "2024-11-14T10:30:00.000Z"
}
```

### Paginated Response

```json
{
  "data": [...],
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-11-14T10:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "timestamp": "2024-11-14T10:30:00.000Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "timestamp": "2024-11-14T10:30:00.000Z",
  "path": "/api/patients",
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "must be a valid email" }
  ]
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email/password/OTP |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token expired |
| `AUTH_TOKEN_INVALID` | 401 | Malformed token |
| `AUTH_REFRESH_REVOKED` | 401 | Refresh token revoked |
| `AUTH_OTP_EXPIRED` | 400 | OTP expired |
| `AUTH_OTP_MAX_ATTEMPTS` | 429 | Too many OTP attempts |
| `AUTH_RATE_LIMITED` | 429 | Rate limit exceeded |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@clinic.com",
  "password": "securePass123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationSlug": "my-clinic"  // optional
}
```

**Response (201):**
```json
{
  "data": { "userId": "uuid", "message": "Check email for verification code" }
}
```

#### Request OTP
```http
POST /api/auth/request-otp
Content-Type: application/json

{ "email": "user@clinic.com" }
```

**Response (201):**
```json
{ "data": { "success": true } }
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{ "email": "user@clinic.com", "code": "123456" }
```

**Response (201):**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "uuid", "email": "user@clinic.com", "roles": ["staff"] }
  }
}
```

#### Verify Email (Registration)
```http
POST /api/auth/verify-email
Content-Type: application/json

{ "userId": "uuid", "code": "123456" }
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{ "email": "user@clinic.com" }
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{ "token": "reset_jwt_token", "password": "newSecurePass123" }
```

#### Refresh Tokens
```http
POST /api/auth/refresh
Content-Type: application/json
Authorization: Bearer <expired_access_token>

{ "refreshToken": "<refresh_token>" }
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{ "refreshToken": "<refresh_token>" }
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

### Identity

#### Organizations

| Method | Endpoint | Permissions | Description |
|--------|----------|-------------|-------------|
| POST | `/api/identity/organizations` | `create Organization` | Create organization |
| GET | `/api/identity/organizations` | `read Organization` | List organizations |
| GET | `/api/identity/organizations/:id` | `read Organization` | Get organization |
| PATCH | `/api/identity/organizations/:id` | `update Organization` | Update organization |

**Create Org Request:**
```json
{ "name": "My Clinic", "slug": "my-clinic" }
```

#### Locations

| Method | Endpoint | Permissions | Description |
|--------|----------|-------------|-------------|
| POST | `/api/identity/locations` | `create Location` | Create location |
| GET | `/api/identity/locations` | `read Location` | List locations |

#### Staff

| Method | Endpoint | Permissions | Description |
|--------|----------|-------------|-------------|
| POST | `/api/identity/staff` | `create Staff` | Invite staff |
| GET | `/api/identity/staff` | `read Staff` | List staff |
| GET | `/api/identity/staff/:id` | `read Staff` | Get staff |
| PATCH | `/api/identity/staff/:id` | `update Staff` | Update staff |
| DELETE | `/api/identity/staff/:id` | `delete Staff` | Deactivate staff |

**Invite Staff Request:**
```json
{
  "email": "newstaff@clinic.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "PHYSICIAN",
  "locationId": "location-uuid"
}
```

---

### Patients

| Method | Endpoint | Permissions | Description |
|--------|----------|-------------|-------------|
| POST | `/api/patients` | `create Patient` | Create patient |
| GET | `/api/patients` | `read Patient` | List patients |
| GET | `/api/patients/:id` | `read Patient` | Get patient chart |
| PATCH | `/api/patients/:id` | `update Patient` | Update patient |
| DELETE | `/api/patients/:id` | `delete Patient` | Soft delete patient |
| GET | `/api/patients/search` | `read Patient` | Search patients |
| POST | `/api/patients/duplicates/check` | `read Patient` | Check duplicates |
| POST | `/api/patients/:id/merge` | `update Patient` | Merge charts |

**Query Parameters (List):**
```
page=1&limit=20&search=john&sort=lastName&order=asc
```

**Create Patient Request:**
```json
{
  "mrn": "MRN001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "sex": "MALE",
  "phone": "+15551234567",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  }
}
```

#### Allergies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/:id/allergies` | List allergies |
| POST | `/api/patients/:id/allergies` | Add allergy |
| PATCH | `/api/patients/:id/allergies/:allergyId` | Update allergy |
| DELETE | `/api/patients/:id/allergies/:allergyId` | Remove allergy |

**Allergy Request:**
```json
{
  "allergen": "Penicillin",
  "severity": "SEVERE",
  "reaction": "Anaphylaxis",
  "onsetDate": "2020-01-15"
}
```

#### Medications
```http
GET /api/patients/:id/medications
```

#### Medical Histories
```http
GET /api/patients/:id/histories
```

#### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients/:id/documents` | List documents |
| POST | `/api/patients/:id/documents` | Upload document (multipart) |
| GET | `/api/patients/:id/documents/:docId` | Download document |
| DELETE | `/api/patients/:id/documents/:docId` | Delete document |

---

### Scheduling

#### Appointments

| Method | Endpoint | Permissions | Description |
|--------|----------|-------------|-------------|
| POST | `/api/scheduling/appointments` | `create Appointment` | Book appointment |
| GET | `/api/scheduling/appointments` | `read Appointment` | List appointments |
| GET | `/api/scheduling/appointments/:id` | `read Appointment` | Get appointment |
| PATCH | `/api/scheduling/appointments/:id` | `update Appointment` | Update appointment |
| POST | `/api/scheduling/appointments/:id/cancel` | `update Appointment` | Cancel |
| POST | `/api/scheduling/appointments/:id/reschedule` | `update Appointment` | Reschedule |

**Book Appointment Request:**
```json
{
  "patientId": "patient-uuid",
  "providerId": "staff-uuid",
  "locationId": "location-uuid",
  "startTime": "2024-11-20T10:00:00Z",
  "endTime": "2024-11-20T10:30:00Z",
  "type": "OFFICE_VISIT",
  "reason": "Annual checkup"
}
```

#### Provider Schedule
```http
GET /api/scheduling/providers/:id/schedule?start=2024-11-01&end=2024-11-30
POST /api/scheduling/providers/:id/schedule
```

#### Available Slots
```http
GET /api/scheduling/slots?providerId=staff-uuid&date=2024-11-20
```

#### Waitlist
```http
POST /api/scheduling/waitlist
GET /api/scheduling/waitlist
```

---

### Encounters

| Method | Endpoint | Permissions | Description |
|--------|----------|-------------|-------------|
| POST | `/api/encounters` | `create Encounter` | Start encounter |
| GET | `/api/encounters` | `read Encounter` | List encounters |
| GET | `/api/encounters/:id` | `read Encounter` | Get encounter |
| PATCH | `/api/encounters/:id` | `update Encounter` | Update encounter |
| POST | `/api/encounters/:id/complete` | `update Encounter` | Complete |

**Start Encounter Request:**
```json
{
  "patientId": "patient-uuid",
  "providerId": "staff-uuid",
  "locationId": "location-uuid",
  "type": "OFFICE_VISIT",
  "chiefComplaint": "Follow-up for hypertension"
}
```

#### Clinical Notes
```http
GET /api/encounters/:id/notes
POST /api/encounters/:id/notes
```

#### Diagnoses
```http
GET /api/encounters/:id/diagnoses
POST /api/encounters/:id/diagnoses
```

---

### Clinical Workflows

#### Forms
```http
POST /api/clinical-workflows/forms
GET /api/clinical-workflows/forms
GET /api/clinical-workflows/forms/:id
POST /api/clinical-workflows/forms/:id/submit
```

#### Orders
```http
POST /api/clinical-workflows/orders
GET /api/clinical-workflows/orders
PATCH /api/clinical-workflows/orders/:id
```

#### Results
```http
POST /api/clinical-workflows/results
GET /api/clinical-workflows/results
```

---

### Billing

#### Invoices
```http
POST /api/billing/invoices
GET /api/billing/invoices
GET /api/billing/invoices/:id
POST /api/billing/invoices/:id/finalize
POST /api/billing/invoices/:id/payments
```

#### Claims
```http
POST /api/billing/claims
GET /api/billing/claims
PATCH /api/billing/claims/:id
```

#### Adjustments
```http
POST /api/billing/adjustments
```

---

### Inventory

#### Items
```http
POST /api/inventory/items
GET /api/inventory/items
GET /api/inventory/items/:id
PATCH /api/inventory/items/:id
```

#### Stock
```http
GET /api/inventory/stock
POST /api/inventory/stock/adjust
```

#### Suppliers
```http
POST /api/inventory/suppliers
GET /api/inventory/suppliers
```

#### Purchase Orders
```http
POST /api/inventory/purchase-orders
GET /api/inventory/purchase-orders
POST /api/inventory/purchase-orders/:id/receive
```

---

### Health

```http
GET /api/health
GET /api/health/live
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global | 100 req | 1 minute |
| `/auth/request-otp` | 5 | 1 hour (per email) |
| `/auth/verify-otp` | 5 | per OTP |
| `/auth/register` | 10 | 1 hour (per IP) |

Exceeded limits return `429 Too Many Requests` with `Retry-After` header.

---

## Versioning

API version in header:
```
Accept: application/vnd.clinic-erp.v1+json
```

Current version: `v1`

---

## OpenAPI/Swagger

Not yet implemented. Planned for future release.