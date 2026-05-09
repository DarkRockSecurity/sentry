import {
  ShieldCheck,
  Siren,
  BookOpen,
  Users,
  FileSearch,
  Radio,
} from "lucide-react";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  teal: "#00B4A6",
  panel: "#0F1623",
  panelBorder: "#1E293B",
};

const items = [
  {
    icon: ShieldCheck,
    title: "NIST CSF 2.0 Assessment",
    body: "Run guided maturity assessments across all six CSF 2.0 functions. Generate professional reports with category and subcategory scoring, gap analysis, and prioritized recommendations.",
  },
  {
    icon: Siren,
    title: "Incident Commander",
    body: "Real-time incident command with SLA tickers, IOC tracking, parent/child tickets, attorney-client privilege markers, and automatic phase progression across the IR lifecycle.",
  },
  {
    icon: BookOpen,
    title: "Playbooks & Tabletop",
    body: "14 incident response playbooks mapped to IR phases. Run live tabletop exercises with threat profiles, objective scorecards, AAR findings, and exportable Light TTX summaries.",
  },
  {
    icon: FileSearch,
    title: "Forensics Vault",
    body: "Evidence vault with SHA-256 hashing, chain-of-custody tracking, and role-based access control. Every file action is logged for the report record.",
  },
  {
    icon: Users,
    title: "Stakeholders & Access",
    body: "Maintain core, extended, and external IR contacts. Assign roles with least-privilege RBAC and stakeholder group permissions for every module.",
  },
  {
    icon: Radio,
    title: "Communications",
    body: "Notification service with CONFIDENTIAL and PRIVILEGED headers, templated stakeholder updates, and automatic capture into the incident timeline.",
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" style={{ padding: "88px 28px", borderTop: `1px solid ${colors.panelBorder}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Capabilities"
          title="Everything an IR team needs in one workspace."
          subtitle="Sentry replaces the patchwork of spreadsheets, runbooks, ticket queues, and chat threads that most security teams cobble together during a real incident."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginTop: 48,
          }}
        >
          {items.map((item) => (
            <article
              key={item.title}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.panelBorder}`,
                borderRadius: 14,
                padding: 24,
                transition: "border-color 0.2s, transform 0.2s",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0, 180, 166, 0.12)",
                  border: `1px solid rgba(0, 180, 166, 0.32)`,
                  color: colors.teal,
                  marginBottom: 16,
                }}
              >
                <item.icon size={20} />
              </div>
              <h3
                style={{
                  fontFamily: "Figtree, sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: colors.text,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: "Source Sans 3, sans-serif",
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: colors.textMuted,
                  marginTop: 10,
                }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
      <div
        style={{
          color: colors.teal,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: "Figtree, sans-serif",
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontFamily: "Figtree, sans-serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 800,
          color: colors.text,
          margin: "12px 0 0",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: 17,
            color: colors.textMuted,
            lineHeight: 1.55,
            marginTop: 16,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
