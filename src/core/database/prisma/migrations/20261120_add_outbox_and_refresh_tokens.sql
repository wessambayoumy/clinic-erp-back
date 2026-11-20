CREATE TABLE IF NOT EXISTS "outbox_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "aggregateId" TEXT NOT NULL,
  "aggregateType" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "metadata" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lockedAt" TIMESTAMPTZ,
  "publishedAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "outbox_events_pending_idx"
  ON "outbox_events" ("publishedAt", "lockedAt", "createdAt");

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "refresh_tokens_expires_at_idx"
  ON "refresh_tokens" ("expiresAt");

CREATE INDEX IF NOT EXISTS "refresh_tokens_revoked_at_idx"
  ON "refresh_tokens" ("revokedAt");
