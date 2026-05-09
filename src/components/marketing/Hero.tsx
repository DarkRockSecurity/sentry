import Link from "next/link";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
};

export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "96px 28px 88px",
      }}
    >
      <BackgroundGlow />
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            border: "1px solid rgba(0, 180, 166, 0.35)",
            borderRadius: 999,
            background: "rgba(0, 180, 166, 0.08)",
            color: colors.tealLight,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            marginBottom: 28,
            fontFamily: "Figtree, sans-serif",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: colors.teal,
              boxShadow: `0 0 8px ${colors.teal}`,
            }}
          />
          SENTRY v3.1 — CYBER RESILIENCE PLATFORM
        </div>

        <h1
          style={{
            fontFamily: "Figtree, sans-serif",
            fontSize: "clamp(40px, 6vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.05,
            color: colors.text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          The operating system for{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealLight})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            cyber resilience.
          </span>
        </h1>

        <p
          style={{
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: 19,
            lineHeight: 1.55,
            color: colors.textMuted,
            margin: "24px auto 0",
            maxWidth: 720,
          }}
        >
          Sentry unifies cybersecurity assessment, incident command, playbooks, tabletop exercises,
          forensics, and stakeholder communication into a single workspace built for the way
          security teams actually operate.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
          <Link
            href="/login"
            style={{
              padding: "14px 26px",
              borderRadius: 10,
              background: `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
              color: "#0A0E14",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(0, 180, 166, 0.32)",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            Sign in to Sentry →
          </Link>
          <a
            href="mailto:contact@darkrocksecurity.com?subject=Sentry%20demo"
            style={{
              padding: "14px 26px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.04)",
              color: colors.text,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: "none",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            Talk to us
          </a>
        </div>

        <div
          style={{
            marginTop: 64,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            color: colors.textMuted,
            fontFamily: "Figtree, sans-serif",
          }}
        >
          <Stat number="18" label="Integrated modules" />
          <Stat number="14" label="IR playbooks" />
          <Stat number="NIST CSF 2.0" label="Assessment framework" />
          <Stat number="Single pane" label="Of glass" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div style={{ color: "#E2E8F0", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{number}</div>
      <div style={{ color: "#64748B", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", marginTop: 4 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(0, 180, 166, 0.16) 0%, rgba(0, 180, 166, 0) 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
