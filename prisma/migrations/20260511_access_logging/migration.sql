-- Extend User with company + job title
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "company"  TEXT,
  ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;

-- New access activity audit log
CREATE TABLE IF NOT EXISTS "AccessActivityLog" (
  "id"           TEXT PRIMARY KEY,
  "tenantId"     TEXT NOT NULL,
  "actorUserId"  TEXT,
  "actorName"    TEXT,
  "actorEmail"   TEXT,
  "action"       TEXT NOT NULL,
  "targetUserId" TEXT,
  "targetEmail"  TEXT,
  "targetName"   TEXT,
  "metadata"     JSONB,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT "AccessActivityLog_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "AccessActivityLog_tenantId_createdAt_idx"
  ON "AccessActivityLog" ("tenantId", "createdAt");
CREATE INDEX IF NOT EXISTS "AccessActivityLog_tenantId_action_idx"
  ON "AccessActivityLog" ("tenantId", "action");
CREATE INDEX IF NOT EXISTS "AccessActivityLog_tenantId_actorUserId_idx"
  ON "AccessActivityLog" ("tenantId", "actorUserId");
