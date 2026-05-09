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

export default async function TenantsList() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <>
      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ color: colors.tealLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "Figtree, sans-serif" }}>TENANTS</div>
          <h1 style={{ color: colors.text, fontSize: 26, fontWeight: 800, margin: "6px 0 0", fontFamily: "Figtree, sans-serif", letterSpacing: "-0.01em" }}>
            All onboarded clients
          </h1>
          <p style={{ color: colors.textMuted, fontSize: 13, margin: "6px 0 0" }}>{tenants.length} tenant{tenants.length === 1 ? "" : "s"}</p>
        </div>
        <Link
          href="/admin/tenants/new"
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
            color: "#0A0E14",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            fontFamily: "Figtree, sans-serif",
            boxShadow: "0 4px 16px rgba(0,180,166,0.22)",
          }}
        >
          + Onboard new client
        </Link>
      </header>

      <div style={{ background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Source Sans 3, sans-serif" }}>
          <thead>
            <tr style={{ background: "#0A0E14", borderBottom: `1px solid ${colors.panelBorder}` }}>
              <Th>Name</Th>
              <Th>Plan</Th>
              <Th>Status</Th>
              <Th>Users</Th>
              <Th>Created</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, color: colors.textDim, textAlign: "center", fontSize: 13 }}>
                  No tenants yet. Use the green button above to onboard your first.
                </td>
              </tr>
            ) : (
              tenants.map((t) => (
                <tr key={t.id} style={{ borderTop: `1px solid ${colors.panelBorder}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/tenants/${t.id}`} style={{ color: colors.text, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                      {t.name}
                    </Link>
                    <div style={{ color: colors.textDim, fontSize: 11, marginTop: 2 }}>
                      {t.slug}
                      {t.isDemoTenant && <span style={{ color: colors.tealLight, marginLeft: 8 }}>· demo</span>}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Tag color={planColor(t.plan)}>{t.plan.toUpperCase()}</Tag>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Tag color={statusColor(t.status)}>{t.status.toUpperCase()}</Tag>
                  </td>
                  <td style={{ padding: "12px 16px", color: colors.text, fontSize: 13 }}>{t._count.users}</td>
                  <td style={{ padding: "12px 16px", color: colors.textMuted, fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link href={`/admin/tenants/${t.id}`} style={{ color: colors.tealLight, fontSize: 12, textDecoration: "none" }}>
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: "10px 16px", color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Figtree, sans-serif" }}>{children}</th>;
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700, color, background: color + "1A", border: `1px solid ${color}33`, letterSpacing: "0.06em" }}>
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
