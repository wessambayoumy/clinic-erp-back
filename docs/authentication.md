# Authentication Documentation

## Overview

The authentication system implements **JWT-based access/refresh tokens** with **email OTP passwordless sign-in** and **password recovery**. Built on NestJS Passport, Argon2id hashing, and custom guards/decorators.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
                        AuthModule
├── AuthController          # HTTP endpoints
├── AuthService             # Business logic
├── JwtModule               # Token generation/validation
├── MailModule              # Email delivery
├── BullMQModule            # Background email jobs
├── RedisModule             # OTP caching, rate limiting
├── RLSModule               # Tenant context for transactions
├── SecurityModule          # Argon2id password hashing
└── IdentityModule          # User/account persistence
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flows

### 1. Email OTP Sign-In (Passwordless)

```
POST /api/auth/request-otp
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
  AuthService.requestOtp(email)
  ├── Rate limit check (Redis: EMAIL_REQUEST_LIMIT_PER_HOUR)
  ├── Generate 6-digit code
  ├── Hash code with HMAC-SHA256 (EMAIL_OTP_HASH_SECRET)
  ├── Store hash in Redis (TTL: 10 min)
  ├── Enqueue email job (BullMQ: EmailQueueEnum.ACCOUNT_NOTIFICATIONS)
  └── Return { success: true }
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
POST /api/auth/verify-otp
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
  AuthService.verifyOtp(email, code)
  ├── Retrieve hash from Redis
  ├── Verify HMAC (constant-time comparison)
  ├── Check attempt count (max: EMAIL_CODE_MAX_ATTEMPTS)
  ├── On success: create/get user in IdentityModule
  ├── Generate JWT access + refresh tokens
  ├── Store refresh token hash in Redis (TTL: JWT_REFRESH_EXPIRES_IN)
  └── Return { accessToken, refreshToken, user }
└─────────────────────────────────────────────────────────────────┘
```

### 2. Registration with Email Verification

```
POST /api/auth/register
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
  AuthService.register(dto)
  ├── Validate email uniqueness (IdentityModule)
  ├── Hash password with Argon2id (SecurityModule)
  ├── Create user + staff record in transaction
  ├── Generate email verification OTP
  ├── Enqueue AccountOtpMail
  └── Return { userId, message: 'Check email for verification code' }
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
POST /api/auth/verify-email
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
  AuthService.verifyEmail(userId, code)
  ├── Verify OTP (same as sign-in flow)
  ├── Mark user.emailVerified = true
  ├── Generate JWT tokens
  └── Return { accessToken, refreshToken, user }
└─────────────────────────────────────────────────────────────────┘
```

### 3. Password Recovery

```
POST /api/auth/forgot-password
    │
    ▼
  AuthService.forgotPassword(email) → Enqueues PasswordChangedMail (after reset)

POST /api/auth/reset-password
    │
    ▼
  AuthService.resetPassword(token, newPassword)
  ├── Verify reset token (JWT with short expiry)
  ├── Hash new password with Argon2id
  ├── Update user password
  ├── Invalidate all refresh tokens for user
  └── Return { success: true }
```

### 4. Token Refresh

```
POST /api/auth/refresh
    │
    ▼
  AuthService.refreshTokens(refreshToken)
  ├── Verify refresh token signature (JWT_REFRESH_SECRET)
  ├── Check Redis for token hash (revocation check)
  ├── Generate new access + refresh token pair
  ├── Rotate: store new refresh hash, delete old
  └── Return { accessToken, refreshToken }
```

### 5. Logout

```
POST /api/auth/logout
    │
    ▼
  AuthService.logout(userId, refreshToken)
  ├── Delete refresh token hash from Redis
  ├── (Optional) Add access token to blocklist
  └── Return { success: true }
```

## JWT Token Structure

### Access Token (15 min default)

```json
{
  "sub": "user-uuid",
  "email": "user@clinic.com",
  "organizationId": "org-uuid",
  "locationId": "location-uuid",
  "roles": ["staff", "admin"],
  "permissions": ["patients:read", "patients:write", "scheduling:read"],
  "iat": 1699900000,
  "exp": 1699900900,
  "iss": "clinic-erp",
  "aud": "clinic-erp-api"
}
```

### Refresh Token (90 days default)

```json
{
  "sub": "user-uuid",
  "tokenId": "random-uuid",  // For rotation/revocation
  "iat": 1699900000,
  "exp": 1702492000,
  "iss": "clinic-erp",
  "aud": "clinic-erp-api"
}
```

## Guards & Decorators

### `@Public()` Decorator

Marks route as **not requiring authentication**:

```typescript
// common/decorators/auth/public.decorator.ts
export const Public = () => SetMetadata('isPublic', true);
```

```typescript
@Controller('auth')
export class AuthController {
  @Public()
  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) { ... }
}
```

### `@CurrentUser()` Decorator

Extracts authenticated user from request:

```typescript
// common/decorators/auth/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard
    return data ? user?.[data] : user;
  },
);
```

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: UserPayload) {
  return this.authService.getProfile(user.sub);
}
```

### `JwtAuthGuard`

Validates JWT access token via Passport strategy:

```typescript
// common/guards/auth/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Allow @Public() routes
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

### `JwtStrategy` (Passport)

```typescript
// common/strategies/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('auth.jwt.accessSecret'),
      issuer: config.get('auth.jwt.issuer'),
      audience: config.get('auth.jwt.audience'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    return {
      sub: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      locationId: payload.locationId,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
```

## Password Hashing (SecurityModule)

Uses **Argon2id** via `SecurityModule`:

```typescript
// common/modules/security/security.module.ts
@Global()
@Module({
  providers: [
    {
      provide: 'ARGON2_OPTIONS',
      useValue: {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,  // 64 MB
        timeCost: 3,
        parallelism: 1,
      },
    },
    PasswordService,
  ],
  exports: [PasswordService],
})
export class SecurityModule {}

// common/services/security/password.service.ts
@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, this.options);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
```

## OTP Services

### `OtpCacheService` (Redis)

```typescript
// common/services/email/otp/otp-cache.service.ts
@Injectable()
export class OtpCacheService {
  private readonly ttl = 600; // 10 minutes

  async set(email: string, codeHash: string): Promise<void> {
    await this.redis.setex(`otp:${email}`, this.ttl, codeHash);
  }

  async get(email: string): Promise<string | null> {
    return this.redis.get(`otp:${email}`);
  }

  async incrementAttempts(email: string): Promise<number> {
    return this.redis.incr(`otp:attempts:${email}`);
  }

  async delete(email: string): Promise<void> {
    await this.redis.del(`otp:${email}`, `otp:attempts:${email}`);
  }
}
```

### `OtpCredentialService`

```typescript
// common/services/email/otp/otp-credential.service.ts
@Injectable()
export class OtpCredentialService {
  private readonly maxAttempts = 5;

  async verify(email: string, code: string): Promise<boolean> {
    const hash = await this.cache.get(email);
    if (!hash) return false;

    const attempts = await this.cache.incrementAttempts(email);
    if (attempts > this.maxAttempts) {
      await this.cache.delete(email);
      throw new TooManyAttemptsException();
    }

    const valid = await this.hashService.verify(code, hash);
    if (valid) await this.cache.delete(email);
    return valid;
  }
}
```

## Email Templates

Located in `core/external/email/templates/`:

| Template | Purpose | Variables |
|----------|---------|-----------|
| `AccountOtpMail` | Registration verification | `code`, `userName` |
| `LoginNoticeMail` | New device/login alert | `device`, `location`, `time` |
| `PasswordChangedMail` | Password reset confirmation | `time` |
| `StaffInvitationMail` | Invite staff member | `inviteLink`, `organizationName` |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/request-otp` | 5/hour | Per email |
| `POST /auth/verify-otp` | 5 attempts | Per OTP |
| `POST /auth/register` | 10/hour | Per IP |
| `POST /auth/refresh` | 60/min | Per user |

Implemented via:
- Redis counters (OTP endpoints)
- `ThrottlerGuard` (global, 100 req/min per IP)

## Token Revocation

- **Refresh tokens**: Stored as hash in Redis with TTL = token expiry
- **Logout**: Deletes refresh token hash
- **Password change**: Invalidates all refresh tokens for user
- **Access tokens**: Short-lived (15min); no blocklist (stateless)

To add access token blocklist:
```typescript
// In JwtStrategy.validate()
const isBlocked = await this.redis.exists(`blocklist:${payload.jti}`);
if (isBlocked) throw new UnauthorizedException();
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Invalid email/password or OTP |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token expired |
| `AUTH_TOKEN_INVALID` | 401 | Malformed or tampered token |
| `AUTH_REFRESH_REVOKED` | 401 | Refresh token not found/revoked |
| `AUTH_OTP_EXPIRED` | 400 | OTP code expired |
| `AUTH_OTP_MAX_ATTEMPTS` | 429 | Too many verification attempts |
| `AUTH_RATE_LIMITED` | 429 | Request rate limit exceeded |
| `AUTH_EMAIL_EXISTS` | 409 | Email already registered |
| `AUTH_USER_NOT_FOUND` | 404 | User not found |

## Testing Authentication

```typescript
// test/integration/auth.e2e-spec.ts
describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    authService = module.get(AuthService);
    await app.init();
  });

  it('should request OTP and verify', async () => {
    const email = 'test@example.com';

    // Request OTP
    await request(app.getHttpServer())
      .post('/api/auth/request-otp')
      .send({ email })
      .expect(201);

    // Get OTP from test mail transport (file-based)
    const code = await getLatestOtpFromFile(email);

    // Verify OTP
    const res = await request(app.getHttpServer())
      .post('/api/auth/verify-otp')
      .send({ email, code })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });
});
```

## Security Checklist

- [ ] JWT secrets ≥ 32 chars, rotated periodically
- [ ] `MAIL_TRANSPORT=smtp` in production
- [ ] HTTPS enforced (reverse proxy)
- [ ] Secure cookies for refresh token (if using cookie storage)
- [ ] CORS restricted to known origins
- [ ] Rate limiting on all auth endpoints
- [ ] Argon2id parameters tuned for hardware
- [ ] OTP codes 6 digits, 10-min TTL, 5 attempts max
- [ ] Refresh token rotation on each use
- [ ] Password reset tokens single-use, short expiry