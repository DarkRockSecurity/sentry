import { SectionHeader } from "./Capabilities";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  teal: "#00B4A6",
  panel: "#0F1623",
  panelBorder: "#1E293B",
};

const steps = [
  {
    n: "01",
    title: "Assess",
    body: "Onboard the organization, profile the tech stack, and run a NIST CSF 2.0 maturity assessment. Sentry generates a prioritized recommendation set and a board-ready report.",
  },
  {
    n: "02",
    title: "Prepare",
    body: "Build IR plans, assign stakeholders, configure 14 ready-to-run playbooks, and stress-test readiness with tabletop exercises. Findings convert directly into tasks and policies.",
  },
  {
    n: "03",
    title: "Respond",
    body: "When an incident hits, the Commander runs the lifecycle live — phase tracking, IOCs, evidence chain-of-custody, stakeholder comms, and an auditable timeline are captured automatically.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" style={{ padding: "88px 28px", background: "rgba(0,180,166,0.025)", borderTop: `1px solid ${colors.panelBorder}`, borderBottom: `1px solid ${colors.panelBorder}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="How it works"
          title="Assess. Prepare. Respond."
          subtitle="Sentry is structured around the actual lifecycle of cyber resilience — not around audit checkboxes."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 48,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.panelBorder}`,
                borderRadius: 14,
                padding: 28,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  fontSize: 96,
                  fontWeight: 800,
                  color: "rgba(0, 180, 166, 0.07)",
                  fontFamily: "Figtree, sans-serif",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  color: colors.teal,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                }}
              >
                STEP {s.n}
              </div>
              <h3
                style={{
                  color: colors.text,
                  fontFamily: "Figtree, sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  margin: "10px 0 12px",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: colors.textMuted,
                  fontFamily: "Source Sans 3, sans-serif",
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
