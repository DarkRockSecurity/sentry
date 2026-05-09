import type { ReactNode } from "react";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelBorder: "#1E293B",
};

export function DocTitle({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <header style={{ marginBottom: 28 }}>
      {eyebrow && (
        <div
          style={{
            color: colors.teal,
            fontFamily: "Figtree, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      )}
      <h1
        style={{
          fontFamily: "Figtree, sans-serif",
          fontSize: "clamp(30px, 4vw, 40px)",
          fontWeight: 800,
          color: colors.text,
          margin: "8px 0 0",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {children}
      </h1>
    </header>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "Source Sans 3, sans-serif",
        fontSize: 18,
        lineHeight: 1.6,
        color: colors.textMuted,
        margin: "0 0 32px",
      }}
    >
      {children}
    </p>
  );
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      style={{
        fontFamily: "Figtree, sans-serif",
        fontSize: 26,
        fontWeight: 800,
        color: colors.text,
        margin: "44px 0 14px",
        letterSpacing: "-0.01em",
        scrollMarginTop: 96,
      }}
    >
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      style={{
        fontFamily: "Figtree, sans-serif",
        fontSize: 19,
        fontWeight: 700,
        color: colors.text,
        margin: "28px 0 10px",
        scrollMarginTop: 96,
      }}
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "Source Sans 3, sans-serif",
        fontSize: 16,
        lineHeight: 1.7,
        color: colors.text,
        margin: "0 0 16px",
      }}
    >
      {children}
    </p>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul
      style={{
        fontFamily: "Source Sans 3, sans-serif",
        fontSize: 16,
        lineHeight: 1.75,
        color: colors.text,
        margin: "0 0 16px",
        paddingLeft: 24,
      }}
    >
      {children}
    </ul>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return <li style={{ marginBottom: 6 }}>{children}</li>;
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "0.9em",
        padding: "2px 6px",
        borderRadius: 4,
        background: "rgba(0, 180, 166, 0.1)",
        color: colors.tealLight,
        border: "1px solid rgba(0, 180, 166, 0.18)",
      }}
    >
      {children}
    </code>
  );
}

export function Pre({ children }: { children: ReactNode }) {
  return (
    <pre
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 13.5,
        lineHeight: 1.6,
        color: colors.text,
        background: "#080C12",
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 10,
        padding: 18,
        overflowX: "auto",
        margin: "0 0 20px",
      }}
    >
      {children}
    </pre>
  );
}

export function Note({ children, kind = "info" }: { children: ReactNode; kind?: "info" | "warn" }) {
  const isWarn = kind === "warn";
  return (
    <div
      style={{
        margin: "20px 0",
        padding: "14px 16px",
        borderRadius: 10,
        background: isWarn ? "rgba(245, 158, 11, 0.08)" : "rgba(0, 180, 166, 0.08)",
        border: isWarn ? "1px solid rgba(245, 158, 11, 0.32)" : "1px solid rgba(0, 180, 166, 0.32)",
        color: colors.text,
        fontFamily: "Source Sans 3, sans-serif",
        fontSize: 14.5,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          color: isWarn ? "#F59E0B" : colors.tealLight,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.12em",
          marginBottom: 4,
          fontFamily: "Figtree, sans-serif",
        }}
      >
        {isWarn ? "NOTE" : "TIP"}
      </div>
      {children}
    </div>
  );
}
