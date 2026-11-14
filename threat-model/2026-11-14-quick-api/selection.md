# Architecture selection — clinic-erp-back

This is a selection report, not a completed threat analysis. It names the architecture and bounded secondary scope for the subsequent quick/security run and does not assert that any architecture role or method ran.

## Inspection coverage

Inspected: a bounded read of `src/` (directory listing plus ~25 security-relevant TypeScript/configuration files) and four content searches, recorded in [SYSTEM_UNDER_REVIEW.md](SYSTEM_UNDER_REVIEW.md). Read extent: full files for the items listed there; `otp-credential.service.ts` was read in a prior session and re-cited. Consequential omissions: `prisma/` (including the RLS policy SQL), `src/core/redis/`, `src/common/events/`, the mail transport, `test/` and infrastructure files — all skipped for context budget, leaving the tenant-isolation boundary inferred rather than observed. Unmapped boundary: B-006 tenant→tenant separation inside PostgreSQL (open topology gap G-006). Evidence was freshly read in this run; no library registry revision or project Git revision was read, so version provenance is unknown.

## Recommendation

**Primary architecture: `api`.** The dominant boundary and lifecycle in this system are HTTP request admission and per-request authorization in a REST service: every route is an HTTP endpoint, admission controls (helmet, CORS, throttling, the global JWT guard) sit at the request boundary, and the six existing routes are all request-handling entry points. Component count and module layout were deliberately not used as the deciding factor.

**Bounded secondary: `multi-tenant-saas`.** The tenant-to-tenant isolation boundary B-006, enforced inside a single PostgreSQL instance through transaction-local RLS (`src/common/database/rls/rls.service.ts:39-63`), adds a distinct boundary whose owner is not the request-admission path. It is bounded to tenant separation; it excludes the HTTP admission path already owned by `api`.

## Availability

Both prompt bodies were read in full from the library in this run (`quick/api.md`, `quick/multi-tenant-saas.md`), so both are available within that observed scope. No library catalog or revision was read, so the identities were matched by filename only; this leaves availability unverified beyond the prompts actually inspected.

## Excluded architecture families

`microservices`, `event-driven` and `modular-monolith` were considered and excluded: the inspected evidence shows a single deployable NestJS process with no supplied service decomposition, broker topology (beyond an internal BullMQ queue) or inter-service boundary, so they add no distinct boundary the `api` lens does not already cover. `web` was excluded because no browser client or front-end boundary is in the inspected evidence.

## Next smallest useful evidence item

The RLS policy SQL under `prisma/` showing `current_setting('app.organization_id' …)` usage — it would turn the tenant-isolation boundary from inferred into observed and let the multi-tenant secondary be assessed rather than assumed.
