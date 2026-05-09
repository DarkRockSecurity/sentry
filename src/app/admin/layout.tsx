import { requireSuperAdmin } from "@/lib/auth-helpers";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · Sentry",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();
  return <AdminShell userEmail={session.email}>{children}</AdminShell>;
}
