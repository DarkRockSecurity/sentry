import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { TenantTabs } from "./TenantTabs";

export const dynamic = "force-dynamic";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelBorder: "#1E293B",
  red: "#EF4444",
  green: "#22C55E",
  orange: "#F97316",
  purple: "#8B5CF6",
};

export default async function TenantDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ welcome?: string; tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      organization: true,
      users: { orderBy: { createdAt: "asc" } },
      _count: {
        select: {
          users: true,
          assessments: true,
          incidents: true,
          tickets: true,
          stakeholders: true,
          vendors: true,
          policies: true,
        },
      },
    },
  });

  if (!tenant) notFound();

  return (
    <>
      <Link href="/admin/tenants" style={{ color: colors.tealLight, fontSize: 12, textDecoration: "none" }}>
        ← Tenants
      </Link>

      <header style={{ marginTop: 12, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ color: colors.text, fontSize: 28, fontWeight: 800, margin: 0, fontFamily: "Figtree, sans-serif", letterSpacing: "-0.01em" }}>
            {tenant.name}
          </h1>
          <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{tenant.id}</span>
            <span>· slug: <code style={{ color: colors.text }}>{tenant.slug}</code></span>
            <span>· created {new Date(tenant.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Tag color={planColor(tenant.plan)}>{tenant.plan.toUpperCase()}</Tag>
          <Tag color={statusColor(tenant.status)}>{tenant.status.toUpperCase()}</Tag>
          {tenant.isDemoTenant && <Tag color={colors.tealLight}>DEMO</Tag>}
        </div>
      </header>

      {sp.welcome && (
        <div style={{ marginBottom: 18, padding: "14px 18px", borderRadius: 10, background: colors.green + "10", border: `1px solid ${colors.green}55`, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <div>
            <div style={{ color: colors.green, fontSize: 13, fontWeight: 700 }}>Tenant provisioned</div>
            <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {tenant.users[0]?.email} can now sign in at <code style={{ color: colors.text }}>/login</code>.
            </div>
          </div>
        </div>
      )}

      <TenantTabs
        tenantId={tenant.id}
        active={sp.tab || "overview"}
        tenant={{
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          status: tenant.status,
          isDemoTenant: tenant.isDemoTenant,
          contactName: tenant.contactName,
          contactEmail: tenant.contactEmail,
          contactPhone: tenant.contactPhone,
          createdAt: tenant.createdAt.toISOString(),
          organization: tenant.organization
            ? {
                industry: tenant.organization.industry,
                size: tenant.organization.size,
                website: tenant.organization.website,
                compliance: tenant.organization.compliance,
              }
            : null,
          counts: {
            users: tenant._count.users,
            assessments: tenant._count.assessments,
            incidents: tenant._count.incidents,
            tickets: tenant._count.tickets,
            stakeholders: tenant._count.stakeholders,
            vendors: tenant._count.vendors,
            policies: tenant._count.policies,
          },
        }}
        users={tenant.users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding: "3px 9px", borderRadius: 4, fontSize: 10, fontWeight: 700, color, background: color + "1A", border: `1px solid ${color}33`, letterSpacing: "0.06em" }}>
      {children}
    </span>
  );
}

function planColor(plan: string) {
  if (plan === "enterprise") return colors.purple;
  if (plan === "professional") return colors.teal;
  if (plan === "starter") return colors.tealLight;
  if (plan === "demo") return colors.orange;
  return colors.textDim;
}
function statusColor(status: string) {
  if (status === "active") return colors.green;
  if (status === "trial") return colors.orange;
  if (status === "paused") return colors.textDim;
  return colors.red;
}
