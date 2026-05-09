import { prisma } from "@/lib/db";
import { DemoConsole } from "./DemoConsole";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const tenants = await prisma.tenant.findMany({
    where: { isDemoTenant: true },
    orderBy: { createdAt: "asc" },
    include: {
      users: { orderBy: { invitedAt: "asc" } },
      state: { select: { updatedAt: true, version: true } },
    },
  });

  const template = tenants.find((t) => t.slug === "demo");
  const sessions = tenants.filter((t) => t.slug !== "demo");

  const serialize = (t: typeof tenants[number]) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
    stateUpdatedAt: t.state?.updatedAt?.toISOString() ?? null,
    stateVersion: t.state?.version ?? null,
    users: t.users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      active: u.active,
      invitedAt: u.invitedAt?.toISOString() ?? u.createdAt.toISOString(),
      lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
    })),
  });

  return (
    <DemoConsole
      template={template ? serialize(template) : null}
      sessions={sessions.map(serialize)}
    />
  );
}
