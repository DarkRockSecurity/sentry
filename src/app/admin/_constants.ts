// Constants shared between server actions and client components.
// Kept out of `_actions.ts` because Next requires "use server" files to
// export only async functions.

export const INDUSTRIES = [
  "Healthcare", "Financial Services", "Technology", "Manufacturing",
  "Retail", "Professional Services", "Education", "Government",
  "Energy & Utilities", "Transportation & Logistics", "Other",
] as const;

export const ORG_SIZES = ["1-50", "51-250", "251-1000", "1001-5000", "5000+"] as const;

export const PLANS = ["trial", "starter", "professional", "enterprise", "demo"] as const;
export const STATUSES = ["trial", "active", "paused", "deprovisioned"] as const;
export const ROLES = ["tenant_admin", "analyst", "viewer"] as const;
