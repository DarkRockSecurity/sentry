import Link from "next/link";
import { prisma } from "@/lib/db";

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

export default async function AdminOverview() {
  const [tenants, users, recentTenants] = await Promise.all([
    prisma.tenant.findMany({ select: { id: true, status: true, plan: true, isDemoTenant: true } }),
    prisma.user.count(),
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, plan: true, status: true, isDemoTenant: true, createdAt: true, _count: { select: { users: true } } },
    }),
  ]);

  const active = tenants.filter((t) => t.status === "active").length;
  const trial = tenants.filter((t) => t.status === "trial").length;
  const paused = tenants.filter((t) => t.status === "paused").length;
  const demo = tenants.filter((t) => t.isDemoTenant).length;
  const paidPlans = tenants.filter((t) => t.plan !== "trial" && t.plan !== "demo").length;

  return (
    <>
      <header style={{ marginBottom: 28 }}>
        <div style={{ color: colors.red, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "Figtree, sans-serif" }}>
          DARK ROCK SUPER ADMIN
        </div>
        <h1 style={{ color: colors.text, fontSize: 28, fontWeight: 800, margin: "6px 0 0", fontFamily: "Figtree, sans-serif", letterSpacing: "-0.01em" }}>
          Platform Overview
        </h1>
      </header>

      <div style={{ marginBottom: 28 }}>
        <CategoryHeader label="Tenant Portfolio" sub="Volume + lifecycle state" accent={colors.teal} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 14 }}>
          <Stat label="Tenants" value={tenants.length} accent={colors.teal} />
          <Stat label="Active" value={active} accent={colors.green} />
          <Stat label="Trial" value={trial} accent={colors.orange} />
          <Stat label="Paused" value={paused} accent={colors.textDim} />
        </div>

        <CategoryHeader label="Commercial Mix" sub="Paid customers + active demos" accent={colors.purple} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 14 }}>
          <Stat label="Paid plans" value={paidPlans} accent={colors.purple} />
          <Stat label="Demo tenants" value={demo} accent={colors.tealLight} />
        </div>

        <CategoryHeader label="People" sub="Provisioned across all tenants" accent={colors.tealLight} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <Stat label="Total users" value={users} accent={colors.text} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <Card>
          <Header
            title="Recent tenants"
            sub="Latest 5 onboardings"
            action={<Link href="/admin/tenants" style={linkStyle}>View all →</Link>}
          />
          {recentTenants.length === 0 ? (
            <Empty>No tenants yet. Onboard your first one.</Empty>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentTenants.map((t) => (
                <li
                  key={t.id}
                  style={{ padding: "10px 0", borderTop: `1px solid ${colors.panelBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      style={{ color: colors.text, fontWeight: 700, fontSize: 13, textDecoration: "none" }}
                    >
                      {t.name}
                    </Link>
                    <div style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>
                      {t.slug} · {t._count.users} user{t._count.users === 1 ? "" : "s"} · created {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Tag color={planColor(t.plan)}>{t.plan.toUpperCase()}</Tag>
                    <Tag color={statusColor(t.status)}>{t.status.toUpperCase()}</Tag>
                    {t.isDemoTenant && <Tag color={colors.tealLight}>DEMO</Tag>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <Header title="Quick actions" sub="Common operations" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ActionButton href="/admin/tenants/new" emphasis>
              <strong>+ Onboard a new client</strong>
              <span style={{ display: "block", color: colors.textMuted, fontWeight: 400, marginTop: 2 }}>3-step wizard, atomic provisioning</span>
            </ActionButton>
            <ActionButton href="/admin/tenants">
              <strong>Manage tenants</strong>
              <span style={{ display: "block", color: colors.textMuted, fontWeight: 400, marginTop: 2 }}>Users, status, plan</span>
            </ActionButton>
            <ActionButton href="/admin/demo">
              <strong>Demo controls</strong>
              <span style={{ display: "block", color: colors.textMuted, fontWeight: 400, marginTop: 2 }}>Reset / inspect demo tenant</span>
            </ActionButton>
          </div>
        </Card>
      </div>
    </>
  );
}

function CategoryHeader({ label, sub, accent }: { label: string; sub: string; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        marginBottom: 10,
        borderLeft: `3px solid ${accent}`,
        background: accent + "0A",
        borderRadius: "0 6px 6px 0",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 10px ${accent}55`, flexShrink: 0 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <span style={{ color: accent, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "Figtree, sans-serif" }}>
          {label}
        </span>
        <span style={{ color: colors.textMuted, fontSize: 11 }}>{sub}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderTop: `2px solid ${accent}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: accent, fontSize: 26, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderRadius: 12, padding: 18 }}>{children}</div>;
}

function Header({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <div>
        <div style={{ color: colors.text, fontSize: 14, fontWeight: 700, fontFamily: "Figtree, sans-serif" }}>{title}</div>
        {sub && <div style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "20px 0", color: colors.textDim, fontSize: 12, textAlign: "center" }}>{children}</div>;
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700, color, background: color + "1A", border: `1px solid ${color}33`, letterSpacing: "0.06em" }}>
      {children}
    </span>
  );
}

function ActionButton({ href, children, emphasis }: { href: string; children: React.ReactNode; emphasis?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "12px 14px",
        borderRadius: 8,
        textDecoration: "none",
        color: emphasis ? "#0A0E14" : colors.text,
        background: emphasis ? `linear-gradient(135deg, ${colors.teal}, #009A8E)` : colors.panel,
        border: `1px solid ${emphasis ? colors.teal : colors.panelBorder}`,
        fontSize: 13,
        fontFamily: "Figtree, sans-serif",
        boxShadow: emphasis ? "0 2px 12px rgba(0,180,166,0.18)" : "none",
      }}
    >
      {children}
    </Link>
  );
}

const linkStyle: React.CSSProperties = { color: colors.tealLight, fontSize: 12, textDecoration: "none" };

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
