# NestJS 11 — AI Coding Instructions

These rules govern how AI assistants (Claude, Copilot, Cursor, etc.) must generate and modify code in this repository. They are non-negotiable unless the user explicitly overrides them in a prompt.

---

## 1. File & Folder Structure

### 1.1 One concept per file
- **Enums**: one enum per file. File name = kebab-case of the enum name.
  `role.enum.ts` → `export enum RoleEnum { ADMIN = 'ADMIN', USER = 'USER' }`
- **Interfaces**: one interface per file. `user.interface.ts` → `export interface IUser { ... }`
- **DTOs**: one DTO class per file. `create-user.dto.ts`, `update-user.dto.ts`, `login.dto.ts`. Never bundle request/response DTOs together.
- **Events**: one event class per file. `user-created.event.ts`, `order-shipped.event.ts`.
- **Prisma models**: schema lives in `schema.prisma`; any hand-written mapper/helper type gets its own file, one per file.
- **Guards, Interceptors, Pipes, Filters, Decorators**: one per file.

### 1.2 Naming conventions
| Type | Suffix | Example |
|---|---|---|
| Enum | `.enum.ts` | `role.enum.ts` |
| Interface | `.interface.ts` | `user.interface.ts` |
| DTO | `.dto.ts` | `create-user.dto.ts` |
| Event | `.event.ts` | `user-created.event.ts` |
| Prisma model helper | `.model.ts` | `user.model.ts` |
| Service | `.service.ts` | `user.service.ts` |
| Controller | `.controller.ts` | `user.controller.ts` |
| Module | `.module.ts` | `user.module.ts` |
| Guard | `.guard.ts` | `jwt-auth.guard.ts` |
| Interceptor | `.interceptor.ts` | `logging.interceptor.ts` |
| Repository | `.repository.ts` | `user.repository.ts` |

- Interfaces prefixed with `I` (`IUser`, `IPaginationOptions`).
- Enums suffixed with `Enum` (`RoleEnum`, `OrderStatusEnum`).
- Types suffixed with `Type` if a standalone type file is needed (`sort-order.type.ts` → `SortOrderType`).

### 1.3 Mandatory `index.ts` barrel files
**Every folder must contain an `index.ts`** that re-exports everything else in that same directory (not subdirectories — each subdirectory owns its own barrel).

```ts
// src/modules/user/interfaces/index.ts
export * from './user.interface';
export * from './user-with-roles.interface';
```

Rules for barrels:
- Only `export * from './file'` statements — no logic, no re-declared types.
- Never barrel-export the folder's own `index.ts` recursively.
- Parent-level barrels re-export child barrels by folder, e.g. `export * from './interfaces';`, keeping deep imports like `import { IUser } from '../interfaces'` clean.
- Do not create circular barrel chains (A's index imports B's index which imports A's index) — the AI must check for this before generating.

### 1.4 Standard module layout
```
src/modules/user/
├── controllers/
│   ├── user.controller.ts
│   └── index.ts
├── services/
│   ├── user.service.ts
│   └── index.ts
├── repositories/
│   ├── user.repository.ts
│   └── index.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── query-user.dto.ts
│   └── index.ts
├── interfaces/
│   ├── user.interface.ts
│   └── index.ts
├── enums/
│   ├── role.enum.ts
│   └── index.ts
├── events/
│   ├── user-created.event.ts
│   └── index.ts
├── models/  (Prisma types/mappers, if any hand-written)
│   ├── user.model.ts
│   └── index.ts
├── user.module.ts
└── index.ts
```

---

## 2. Performance

- Runtime is **Express** (`@nestjs/platform-express`) per this project's dependencies — do not introduce Fastify-specific packages.
- Compile with **SWC** (`@swc/core` + `@swc/cli` are present) via `nest-cli.json` `"builder": "swc"` for fast builds/HMR instead of the default `tsc`.
- Use `class-transformer`'s `@Exclude`/`@Expose` with a global `ClassSerializerInterceptor` instead of manual object stripping.
- Enable `compression` middleware at the app level, not per-route.
- All list endpoints must be paginated (cursor or offset) by default — never return unbounded arrays.
- **Prisma-specific**:
  - `select`/`include` explicitly in every query — never fetch full relations by default.
  - Add `@@index`/`@@unique` in `schema.prisma` for every field used in a `where`, `orderBy`, or uniqueness constraint.
  - Use `$transaction` for multi-step writes that must be atomic; prefer the interactive transaction API only when steps are truly dependent, otherwise batch with the array form for lower lock time.
  - Reuse a single `PrismaClient` instance via a `PrismaService` (`OnModuleInit`/`OnModuleDestroy` for `$connect`/`$disconnect`) — never instantiate `PrismaClient` per request.
  - Use `Prisma.validator` or generated types instead of hand-rolled query result types where possible.
- Cache expensive/read-heavy calls (Redis, if introduced) with explicit TTLs; invalidate on writes rather than polling.
- Use `@nestjs/event-emitter` or a queue (BullMQ) for non-critical-path side effects (emails, notifications, audit logs) — never `await` them inline in the request/response cycle.
- Avoid `forwardRef()` unless a genuine circular dependency exists; it defeats DI optimizations and signals a design smell.
- Use request-scoped providers (`Scope.REQUEST`) only when truly necessary — they disable DI caching and hurt throughput.
- Batch DB writes/reads (`createMany`, `Promise.all` for independent queries) instead of looping sequential awaits.
- Use streaming (`StreamableFile`) for large file responses instead of buffering entire files in memory.

## 3. Security

- **Validation**: every DTO uses `class-validator` decorators. Global `ValidationPipe` configured with:
  ```ts
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    forbidUnknownValues: true,
  })
  ```
- **Helmet**: always register `helmet` globally (`app.use(helmet())`).
- **Rate limiting**: `@nestjs/throttler` on all public endpoints, stricter limits on auth/OTP/password-reset routes.
- **CORS**: explicit allow-list of origins — never `origin: true` / `*` in production.
- **Auth**:
  - JWT access + refresh token pair; short-lived access tokens (≤15 min), refresh tokens rotated and stored hashed.
  - Global `AuthGuard` registered via `APP_GUARD`, with an explicit `@Public()` decorator for opt-out routes — default-deny, not default-allow.
  - Passwords hashed with `argon2` or `bcrypt` (cost factor ≥ 12), never reversible encryption.
  - `@types/passport-jwt` is present — use `passport-jwt` strategy with `AuthGuard('jwt')` or wrap it behind a custom global guard; keep the JWT secret/issuer/audience validated, not just the signature.
  - No secrets, tokens, or PII in logs. Use the built-in `Logger`, never `console.log`.
- **SQL injection**: Prisma's query builder parameterizes by default — never drop to `$queryRawUnsafe`/`$executeRawUnsafe` with interpolated user input. If raw SQL is unavoidable, use `$queryRaw`/`$executeRaw` tagged templates only.
- **Mass assignment**: DTOs are the only accepted shape for input — never pass `req.body` directly to `create()`/`update()`.
- **Environment/config**: use `@nestjs/config` with a validated schema (`Joi` or `class-validator`) at bootstrap; fail fast on missing required env vars. Never commit `.env` files.
- **Error handling**: global exception filter returns sanitized error messages in production (no stack traces, no internal paths) while logging full detail server-side.
- **File uploads**: enforce MIME-type allow-lists, size limits, and virus/content validation; never trust client-supplied `Content-Type` or filename.
- **Dependency hygiene**: flag any new dependency with known CVEs; prefer maintained, widely-used packages.
- **HTTPS/HSTS**: enforced at the reverse proxy (nginx) layer; app assumes TLS termination upstream.

## 4. Module Organization

- **Do not create a dedicated module for a single-purpose, stateless utility service.** A service that wraps one narrow concern (e.g. `EmailService`, `EncryptionService`, `HashService`, `JwtService` wrapper, `PdfService`) does not get its own `*.module.ts`.
- Instead, group these utility/infrastructure services into a shared **`SecurityModule`** (for auth/crypto/hash/jwt-related services) or a **`SharedModule`** / **`CoreModule`** (for cross-cutting utilities like email, PDF generation, file storage), exported once so any feature module can import it.
  ```
  src/modules/security/
  ├── services/
  │   ├── hash.service.ts
  │   ├── encryption.service.ts
  │   ├── jwt.service.ts
  │   └── index.ts
  ├── security.module.ts
  └── index.ts
  ```
- A feature module (e.g. `UserModule`, `OrderModule`) is warranted when it owns a domain entity/table, has its own controller, and represents a real bounded context — not for every service the AI generates.
- Before creating a new `*.module.ts`, the AI must check whether the service belongs in an existing shared module instead. Default to **not** creating a module unless the service clearly owns a domain/resource.

## 5. General Code Style

- TypeScript `strict: true`, no `any` unless explicitly justified with a comment.
- Prefer composition over inheritance; keep services thin, push business rules into dedicated domain services when logic grows.
- Repository pattern: controllers → services → repositories → schema/model. Controllers never touch the ODM/ORM directly.
- Constructor-based dependency injection only — no manual instantiation (`new SomeService()`).
- Every public method in a service/controller has an explicit return type — never inferred `Promise<any>`.
- Use `Logger` (scoped per-class: `new Logger(UserService.name)`) instead of `console.*`.
- Lifecycle hooks (`OnModuleInit`, `OnModuleDestroy`) used for setup/teardown instead of ad-hoc `constructor` side effects.

## 6. ESLint — Enforced Rules the AI Must Satisfy

This project lints with a flat config (`eslint.config.mjs`) combining `typescript-eslint` (strict + stylistic, type-checked), `eslint-plugin-security`, `eslint-plugin-sonarjs`, `eslint-plugin-import`, `eslint-plugin-unicorn`, `eslint-plugin-jsdoc`, and `eslint-config-prettier`. Generated code must pass `npx eslint . --max-warnings=0` (aside from the deliberately-noisy exception below). Key rules the AI must write code to satisfy up front, not fix after the fact:

- **Naming (`@typescript-eslint/naming-convention`)** — matches §1.2 exactly and is now lint-enforced, not just convention:
  - Enums: `PascalCase` with `Enum` suffix (`RoleEnum`). Enum members: `UPPER_CASE`.
  - Interfaces: `PascalCase` with `I` prefix (`IUser`).
  - DTO classes specifically must end in `Dto` (enforced separately for `**/*.dto.ts` files).
  - Type aliases, classes: `PascalCase`. Variables: `camelCase`/`UPPER_CASE`/`PascalCase`. Parameters: `camelCase` (leading `_` allowed for unused).
  - `property` selector has no enforced format — DTO/API field names, Prisma-generated shapes, and HTTP header names are exempt.
- **Type safety**: no `any` (`no-explicit-any`), explicit return types on all functions and exported class members (`explicit-function-return-type`, `explicit-module-boundary-types`), no floating/misused promises, no non-null assertions (`!`), exhaustive `switch` over enums (`switch-exhaustiveness-check` — pairs directly with every `*Enum` you define), type-only imports written as `import type` (`consistent-type-imports`).
- **Security (`eslint-plugin-security`)**: no `eval`/`new Function`, no non-literal `fs` paths (path traversal), no unsafe/non-literal `RegExp`, no `child_process` misuse, use `crypto.randomBytes` not `Math.random()` for anything security-sensitive, use `crypto.timingSafeEqual` instead of `===` when comparing secrets/tokens/hashes.
  - `security/detect-object-injection` is set to `warn` and is intentionally noisy (flags any dynamic property access, including safe `Map`/`Record` lookups). Do not blanket-disable it — review each hit and, if it's a genuine false positive, add `// eslint-disable-next-line security/detect-object-injection` with a one-line justification, not a file-level or rule-level disable.
- **Complexity (`eslint-plugin-sonarjs`)**: keep function cognitive complexity ≤ 15 — if a method approaches this, extract helper methods rather than adding an inline disable. No duplicated string literals (5+ occurrences) outside DTOs/tests, no duplicated conditional branches, no nested template literals.
- **Imports (`eslint-plugin-import`)**: no import cycles (`import/no-cycle`) — this is critical given the mandatory barrel-file (`index.ts`) architecture in §1.3; check for cycles before wiring up new barrel re-exports. Imports ordered and grouped (builtin → external → internal → parent → sibling → index) with alphabetization and blank lines between groups.
- **Barrel files (`**/index.ts`)**: named re-exports only — `export default` is banned in barrels.
- **Filenames (`unicorn/filename-case`)**: kebab-case, matching the `.service.ts`/`.controller.ts`/etc. suffix convention in §1.2.
- **`no-console`**: raw `console.*` is a lint error everywhere except test files — always route through Nest's `Logger` per §5.
- **NestJS-decorated files** (`*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.gateway.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.strategy.ts`, `*.filter.ts`) get relaxed rules for empty constructors and static-only classes, since these are normal Nest/DI idioms — do not "fix" these patterns away.
- **Test files** (`*.spec.ts`, `*.e2e-spec.ts`, `/test/**`) relax `no-explicit-any`, non-null assertions, unsafe assignment, duplicate-string, and `no-console` — do not over-engineer test code to satisfy production-strictness rules.
- Prettier runs last in the config and disables any stylistic rule that would conflict with it — never hand-format in a way that fights Prettier (spacing, quotes, trailing commas); let `prettier --write` own that.

## 7. When Generating New Code, the AI Must

1. Identify whether a new enum, interface, DTO, or event is needed — never inline-declare these inside a service/controller file.
2. Create the file in its dedicated folder with the correct suffix.
3. Update (or create) that folder's `index.ts` barrel.
4. Update the parent barrel if a new subfolder was introduced.
5. Add `class-validator`/`class-transformer` decorators to any new DTO.
6. Never skip pagination, rate limiting, or validation "for now" — these are not optional scaffolding steps.
7. Before creating a new module, check whether the service being added is a single-purpose utility — if so, place it in `SecurityModule` or `SharedModule` instead of scaffolding a new module.
8. Write code that satisfies §6's ESLint rules from the start (explicit return types, naming conventions, no `any`, no `console.*`, ordered imports) rather than relying on a later lint-fix pass.