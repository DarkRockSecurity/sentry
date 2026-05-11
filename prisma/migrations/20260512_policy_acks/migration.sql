-- Per-user acknowledgment of published policy versions.
CREATE TABLE IF NOT EXISTS "PolicyAcknowledgment" (
  "id"              TEXT PRIMARY KEY,
  "tenantId"        TEXT NOT NULL,
  "policyId"        TEXT NOT NULL,
  "policyVersionId" TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "userName"        TEXT,
  "userEmail"       TEXT,
  "acknowledgedAt"  TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- One ack per (version, user). Re-clicking is a no-op.
CREATE UNIQUE INDEX IF NOT EXISTS "PolicyAcknowledgment_policyVersionId_userId_key"
  ON "PolicyAcknowledgment" ("policyVersionId", "userId");
CREATE INDEX IF NOT EXISTS "PolicyAcknowledgment_tenantId_policyId_idx"
  ON "PolicyAcknowledgment" ("tenantId", "policyId");
CREATE INDEX IF NOT EXISTS "PolicyAcknowledgment_tenantId_userId_idx"
  ON "PolicyAcknowledgment" ("tenantId", "userId");
