import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

const VIEW_TENANT_COOKIE = "sentry_view_tenant";

/**
 * Get the currently signed-in user (Supabase auth + our User row joined),
 * or null if not signed in. Also resolves `activeTenantId`: the tenantId
 * that subsequent queries should scope to. For super_admins this can be
 * a different tenant than their own (impersonation via cookie); for
 * everyone else it's always their own tenantId.
 */
export async function getSessionUser(): Promise<{
  authId: string;
  email: string;
  user: User | null;
  activeTenantId: string | null;
  isImpersonating: boolean;
} | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const user = await prisma.user.findUnique({ where: { id: authUser.id } });

  // Resolve view-tenant override (only honored for super_admins)
  let activeTenantId: string | null = user?.tenantId ?? null;
  let isImpersonating = false;
  if (user?.role === "super_admin") {
    const store = await cookies();
    const override = store.get(VIEW_TENANT_COOKIE)?.value;
    if (override && override !== user.tenantId) {
      const target = await prisma.tenant.findUnique({ where: { id: override }, select: { id: true } });
      if (target) {
        activeTenantId = target.id;
        isImpersonating = true;
      }
    }
  }

  return {
    authId: authUser.id,
    email: authUser.email ?? "",
    user,
    activeTenantId,
    isImpersonating,
  };
}

/** Throws redirect to /login if not authenticated. */
export async function requireUser() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (!session.user) {
    // Authenticated to Supabase but not yet provisioned in our User table —
    // a state that should only happen during the first-user bootstrap.
    redirect("/login?error=not_provisioned");
  }
  return session;
}

/** Throws redirect to /app if not super_admin. */
export async function requireSuperAdmin() {
  const session = await requireUser();
  if (session.user!.role !== "super_admin") redirect("/app");
  return session;
}

export const VIEW_TENANT_COOKIE_NAME = VIEW_TENANT_COOKIE;
