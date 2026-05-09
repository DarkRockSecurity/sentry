import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

/**
 * Get the currently signed-in user (Supabase auth + our User row joined),
 * or null if not signed in.
 */
export async function getSessionUser(): Promise<{ authId: string; email: string; user: User | null } | null> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;
  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  return { authId: authUser.id, email: authUser.email ?? "", user };
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
