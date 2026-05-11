-- Submitter + named-approver fields for the policy approval workflow.
ALTER TABLE "PolicyVersion"
  ADD COLUMN IF NOT EXISTS "submitterUserId"  TEXT,
  ADD COLUMN IF NOT EXISTS "submitterName"    TEXT,
  ADD COLUMN IF NOT EXISTS "submittedAt"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "approverUserId"   TEXT,
  ADD COLUMN IF NOT EXISTS "approverName"     TEXT,
  ADD COLUMN IF NOT EXISTS "approverSignedAt" TIMESTAMP(3);

-- Backfill: any version that previously held a signoff1 should be treated
-- as the submitter; any signoff2 as the approver. Old columns remain in
-- place but are no longer written to.
UPDATE "PolicyVersion"
SET
  "submitterUserId"  = COALESCE("submitterUserId",  "signoff1UserId"),
  "submitterName"    = COALESCE("submitterName",    "signoff1Name"),
  "submittedAt"      = COALESCE("submittedAt",      "signoff1At"),
  "approverUserId"   = COALESCE("approverUserId",   "signoff2UserId"),
  "approverName"     = COALESCE("approverName",     "signoff2Name"),
  "approverSignedAt" = COALESCE("approverSignedAt", "signoff2At")
WHERE
  "signoff1UserId" IS NOT NULL OR "signoff2UserId" IS NOT NULL;
