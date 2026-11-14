# SYSTEM_UNDER_REVIEW — clinic-erp-back

SYSTEM_UNDER_REVIEW
Bundle: clinic-erp-back, revision unknown (no protected Git revision was read); working tree not_checked: reason — working-tree `status`/diff inspection was skipped under the runbook's clean/process-filter rule, so cleanliness is unknown.
Run: MODE quick; REVIEW_SCOPE security; METHODS []; PRIVACY_PROFILES []; safe root label `clinic-erp-back`; library `grim-prompter` (no revision read); selected prompts `quick/api.md` (primary) and `quick/multi-tenant-saas.md` (secondary); RUN_DIR `threat-model/2026-11-14-quick-api/`.
Purpose: Decide whether the API's request-admission, authorization and session controls protect tenant clinical data before feature endpoints are built on top of them. Primary architecture: `api` (secondary, bounded: `multi-tenant-saas`).
Scope: Response to external HTTP requests; request admission and validation; the global authentication guard and its opt-out; the authorization guard and ability model; the email-OTP sign-up/sign-in/recovery workflows and their Redis state; JWT issuance and verification; the tenant-scoped PostgreSQL access path and RLS; the S3 storage path; environment/secret configuration; the global exception filter and throttling. Out of scope: non-auth feature controllers (none exist yet), BullMQ worker bodies, SMTP/file mail transport internals, observability exporters, infrastructure/CI definitions, and any runtime behaviour — none was executed.

E1 — configuration observation
Locator: src/main.ts:17-55. Bootstrap registers `@fastify/helmet`, `@fastify/compress`, sets a global API prefix, and calls `app.enableCors({ origin: corsOrigins })` from `CORS_ORIGIN`. It registers a global `AllExceptionsFilter`. It does **not** call `app.useGlobalPipes(...)`; `app.listen({ port, host: '0.0.0.0' })`. No `trustProxy` is set.
E2 — implementation observation
Locator: src/app.module.ts:27-59. `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])`; `APP_GUARD` `ThrottlerGuard`; three `APP_INTERCEPTOR`s (`RequestContextInterceptor`, `ErrorInterceptor`, `ResponseInterceptor`); `RequestIdMiddleware` bound to `*path`.
E3 — implementation observation
Locator: src/features/auth/auth.controller.ts:20-78. Exactly six routes, all `@Public()` and each with a per-route `@Throttle` (5–10 per 60 s): `POST /auth/register`, `/auth/register/verify`, `/auth/login`, `/auth/login/verify`, `/auth/forgot-password`, `/auth/reset-password`. No other controller exists in `src/features`.
E4 — implementation observation
Locator: src/features/auth/dtos/register.dto.ts:1-25. Constraints declared: `@IsUUID()` on `organizationId`/`locationId`, `@IsEmail()`, `@MinLength(8)` on `password`, `@MinLength(1)` on names.
E5 — implementation observation
Locator: src/features/auth/dtos/verify-otp.dto.ts:1-20. `@IsUUID()` challengeId, `@Matches(/^\d{6}$/)` on `code`, `@IsEmail()`. Also src/features/auth/dtos/login.dto.ts:1-23 (`@MinLength(8)` password).
E6 — implementation observation
Locator: `src` search for `ValidationPipe|APP_PIPE|useGlobalPipes` → no matches. No global or per-route validation pipe is registered anywhere, so the class-validator decorators in E4/E5 are inert.
E7 — implementation observation
Locator: src/features/auth/auth.service.ts:65-220. `register` throws `ConflictException('An account already uses this email address.')` when a verified account exists. Password hashing goes through `HashService.hash`. `verifyLogin` issues an access token with hard-coded `roles: []`. `requestPasswordReset` returns a deliberately generic message.
E8 — implementation observation
Locator: src/common/services/email/otp/otp-cache.service.ts:14-122. OTP verification uses Redis Lua scripts: an attempt-capped `BEGIN_VERIFY_SCRIPT`, an atomic single-use `CONSUME_SCRIPT`, and a per-subject/hour `RATE_LIMIT_SCRIPT`. Only the digest is stored, with a fixed 300 s TTL (`OTP_TTL_SECONDS`).
E9 — implementation observation
Locator: src/common/services/email/otp/otp-credential.service.ts. OTP digest = HMAC-SHA256 keyed by `EMAIL_OTP_HASH_SECRET` over purpose/subject/code, then Argon2id via `HashService`; verification delegates to `HashService.verify`.
E10 — implementation observation
Locator: src/common/modules/security/services/hash.service.ts:72-153. Argon2id via `argon2.hash/verify` with tunable memory/time/parallelism and an optional pepper; `verify` returns `false` on a malformed digest. `hashToken`/`verifyToken` are a SHA-256 digest with `timingSafeEqual` for high-entropy tokens.
E11 — implementation observation
Locator: src/common/guards/auth/global-auth.guard.ts:12-23. `canActivate` reads the public marker with `this.reflector.getAllAndOverride<boolean>(process.env.IS_PUBLIC_KEY, [...])`; if truthy it returns `true` (bypass), otherwise `super.canActivate(context)` (passport-jwt).
E12 — implementation observation
Locator: src/common/decorators/auth/public.decorator.ts. `@Public()` is `SetMetadata(process.env.IS_PUBLIC_KEY, true)` — the same environment-derived key, so decorator and guard agree only because both read the same variable.
E13 — implementation observation
Locator: src/common/guards/authorization/ability.guard.ts:14-46. `canActivate` returns `true` when no `CHECK_ABILITY_KEY` metadata is present (default-allow), otherwise evaluates each requirement via `AbilityFactory`. It imports `Request` from `express`.
E14 — implementation observation
Locator: `src` search for `APP_GUARD|AbilityGuard|CheckAbility` → `AbilityGuard` is only provided/exported by `authorization.module.ts`; it is **not** registered as `APP_GUARD` and no `@UseGuards(AbilityGuard)` appears in `src/features`. `@CheckAbility` is defined (`check-ability.decorator.ts`) but used by no route.
E15 — implementation observation
Locator: src/common/services/authorization/ability.factory.ts:6-60. `can(action, _subject)` ignores the subject; returns `true` for `admin`; otherwise `abilities.includes(action) || abilities.includes('manage')`. No role in the map equals `manage`, and `roles: []` is issued by E7.
E16 — implementation observation
Locator: src/common/strategies/auth/jwt.strategy.ts:8-31. `secretOrKey` from `auth.jwt.accessSecret`, `issuer`/`audience` read from config (may be `undefined`); `ignoreExpiration: false`. `validate()` coerces `sub/email/organizationId/locationId` with `String(...)` and reads `roles`, but performs no account-existence or active-status check.
E17 — implementation observation
Locator: src/config/auth.config.ts:5-20. `accessSecret`/`refreshSecret` fall back to `generateSecret()` when `NODE_ENV !== 'production'`; `issuer`/`audience` come straight from `process.env` with no default.
E18 — configuration observation
Locator: src/config/config.schema.ts:3-51. `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are `z.string().min(16)`; `JWT_ISSUER`/`JWT_AUDIENCE` are `.optional()`; `EMAIL_OTP_HASH_SECRET` is `.min(32)`; `superRefine` requires `SMTP_URL` when `MAIL_TRANSPORT=smtp` and forbids `file` transport in production.
E19 — configuration observation
Locator: src/config/configuration.module.ts:12-34. `ConfigModule.forRoot({ isGlobal: true, load: [...], validate: zod ..., envFilePath: '.env.dev', cache: true })` — the `.env.dev` path is unconditional for every `NODE_ENV`.
E20 — implementation observation
Locator: src/common/database/rls/rls.service.ts:39-63. `applyContext(tx, ctx)` sets `app.organization_id`/`app.location_id`/`app.current_user_id` with `set_config(..., true)` (transaction-local) using the parameterised `raw.sql` plan, executed on the caller's transaction handle; it logs org/location/user identifiers at debug.
E21 — implementation observation
Locator: src/core/storage/s3/s3.service.ts:83-300. Object keys are `<organizationId>/<folder>/<yyyy>/<mm>/<uuid>.<ext>`; `assertValidOrganizationId` requires a UUID; `assertKeyBelongsToTenant` rejects keys not prefixed by the caller's org or containing `..`; uploads use `ServerSideEncryption.AES256`; no presigned URLs.
E22 — implementation observation
Locator: src/common/guards/stream/stream.guard.ts:29-161. `UploadGuardTransform` enforces a size ceiling, rejects empty files, and verifies magic bytes (`FILE_SIGNATURES`) against the declared MIME type before releasing the header.
E23 — implementation observation
Locator: src/common/filters/all-exceptions.filter.ts:22-91. Non-`HttpException` errors map to a sanitised `{ statusCode: 500, code, message: 'Internal server error' }`; the full error is logged server-side.
E24 — implementation observation
Locator: src/common/modules/auth/authentication.module.ts:17-46 and src/common/common.modules.ts:1-20. `AuthenticationModule` registers `APP_GUARD` `GlobalAuthGuard` and a `'JWT_CONFIG'` factory; `CommonModules` imports/exports `AuthenticationModule`, so the global auth guard is active.
E25 — configuration observation
Locator: src/config/app.config.ts:4-9. `corsOrigin` defaults to `http://localhost:3000` (no wildcard). `apiPrefix` defaults to `api`.

G1 — Unknown: whether any request actually reaches a handler with an unvalidated body at runtime. Static inspection shows no validation pipe (E6) but no request was executed. Needed: a runnable instance (or an e2e test) with an out-of-policy payload against `POST /auth/register`.
G2 — Unknown: the deployment's proxy/TLS topology and whether a reverse proxy terminates TLS in front of `0.0.0.0:PORT`. Needed: proxy configuration or deployment manifest.
G3 — Unknown: whether any future or unwired feature controller exposes tenant resources; none exist today, so authorization gaps are latent. Needed: the feature inventory/route table once features are added.
G4 — Unknown: behaviour of the BullMQ `ACCOUNT_NOTIFICATIONS` worker, the SMTP/file mail transport, and any storage controller. Needed: those modules' sources.
G5 — Unknown: whether an exact secure-coding pack for the NestJS/Fastify/Prisma stack is resolved. Needed: a resolver/catalog result with pack identity and provenance.

Inspection coverage: Bounded read of `src/` by directory listing plus targeted reads of ~25 security-relevant TypeScript and configuration files, and four content searches (validation pipe, CORS/proxy, routes/refresh/logout, guards/`APP_GUARD`). Coverage is partial: `prisma/schema.prisma`, `rls-policies.sql`, worker processors, mail transport, observability exporters, `test/`, CI and infrastructure files were not read.
Files inspected (read extent, this run, working-tree revision unknown):
- src/main.ts (full), src/app.module.ts (full), src/common/common.modules.ts (full)
- src/config/configuration.module.ts (full), src/config/config.schema.ts (full), src/config/app.config.ts (full), src/config/auth.config.ts (full)
- src/features/auth/auth.controller.ts (full), src/features/auth/auth.service.ts (full), src/features/auth/dtos/register.dto.ts (full), src/features/auth/dtos/login.dto.ts (full), src/features/auth/dtos/verify-otp.dto.ts (full)
- src/common/guards/auth/global-auth.guard.ts (full), src/common/guards/authorization/ability.guard.ts (full), src/common/guards/stream/stream.guard.ts (full)
- src/common/decorators/auth/public.decorator.ts (full)
- src/common/strategies/auth/jwt.strategy.ts (full)
- src/common/services/authorization/ability.factory.ts (full)
- src/common/modules/auth/authentication.module.ts (full)
- src/common/modules/security/services/hash.service.ts (full), src/common/modules/security/services/encryption.service.ts (full)
- src/common/services/email/otp/otp-cache.service.ts (full), src/common/services/email/otp/otp-credential.service.ts (read in a prior session; re-cited)
- src/common/database/rls/rls.service.ts (full), src/common/database/repositories/base.repository.ts (full)
- src/common/filters/all-exceptions.filter.ts (full), src/common/interceptors/error.interceptor.ts (full)
- src/core/storage/s3/s3.service.ts (full)
Files or areas not inspected (skipped/unavailable, reason):
- prisma/ (schema, migrations, rls-policies.sql) — skipped: bounded pass, RLS read from the service instead.
- src/core/redis/, src/core/database/prisma/ — skipped: context budget.
- src/common/events/ (BullMQ processors), src/common/services/email/ (transport) — skipped: context budget and G4.
- test/, .github/workflows/, Dockerfiles, package manifests beyond dependency names — skipped: not needed for quick/security.
- Outside scope (labelled separately): non-auth feature controllers (none exist), CI/CD supply chain, observability exporters.
Unmapped trust boundaries: B-006 tenant→tenant isolation inside PostgreSQL rests on `set_config` RLS (E20); the RLS policy SQL itself was not read, so the boundary's enforcement is inferred, not observed (see the model's topology gap).
Redactions: none found after inspection. No `.env`, credential store or key file was opened; secret values appear only as environment-variable names.
