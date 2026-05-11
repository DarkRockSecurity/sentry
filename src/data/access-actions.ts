/**
 * Audit-action vocabulary for AccessActivityLog rows.
 *
 * Each entry has a stable machine id (stored in DB) and human metadata used
 * by the Activity Log UI. Add new actions here when you instrument a new
 * code path that should appear in the audit trail.
 */

export interface AccessActionMeta {
  id: AccessActionId;
  label: string;
  icon: string;
  /** Tint for the icon — uses theme color tokens, mapped at render time. */
  tone: "info" | "good" | "warn" | "bad";
  /** One-line description used in filter UI. */
  description: string;
}

export type AccessActionId =
  | "user_signin"
  | "user_invited"
  | "user_role_changed"
  | "user_profile_updated"
  | "user_disabled"
  | "user_enabled"
  | "user_deleted"
  | "stakeholder_invited"
  | "tenant_impersonation_started"
  | "tenant_impersonation_ended";

export const ACCESS_ACTIONS: Record<AccessActionId, AccessActionMeta> = {
  user_signin:                   { id: "user_signin",                   label: "Signed in",                       icon: "→",  tone: "info", description: "User authenticated to the platform" },
  user_invited:                  { id: "user_invited",                  label: "User invited",                    icon: "✉",  tone: "good", description: "New user provisioned and invited via email" },
  user_role_changed:             { id: "user_role_changed",             label: "Role changed",                    icon: "⇅",  tone: "warn", description: "RBAC tier or platform role updated for an existing user" },
  user_profile_updated:          { id: "user_profile_updated",          label: "Profile updated",                 icon: "✎",  tone: "info", description: "Name, company, or job title changed" },
  user_disabled:                 { id: "user_disabled",                 label: "User disabled",                   icon: "⏸",  tone: "warn", description: "Active flag set to false — user can no longer sign in" },
  user_enabled:                  { id: "user_enabled",                  label: "User re-enabled",                 icon: "▶",  tone: "good", description: "Active flag restored — user can sign in again" },
  user_deleted:                  { id: "user_deleted",                  label: "User deleted",                    icon: "✕",  tone: "bad",  description: "User permanently removed from the tenant" },
  stakeholder_invited:           { id: "stakeholder_invited",           label: "Stakeholder invited",             icon: "👥", tone: "good", description: "Stakeholder promoted to platform user via the Stakeholders module" },
  tenant_impersonation_started:  { id: "tenant_impersonation_started",  label: "Tenant impersonation started",    icon: "🎭", tone: "warn", description: "Super-admin began viewing another tenant" },
  tenant_impersonation_ended:    { id: "tenant_impersonation_ended",    label: "Tenant impersonation ended",      icon: "🎭", tone: "info", description: "Super-admin returned to their own tenant" },
};

export const ACCESS_ACTION_IDS: AccessActionId[] = Object.keys(ACCESS_ACTIONS) as AccessActionId[];
