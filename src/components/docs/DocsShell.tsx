"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RookLogo } from "@/components/marketing/RookLogo";

const colors = {
  obsidian: "#0A0E14",
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelBorder: "#1E293B",
};

const groups = [
  {
    label: "Get started",
    items: [
      { href: "/docs", title: "Overview" },
      { href: "/docs/getting-started", title: "Getting started" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/docs/modules", title: "Modules" },
      { href: "/docs/architecture", title: "Architecture" },
      { href: "/docs/brand", title: "Brand & theming" },
    ],
  },
];

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ background: colors.obsidian, color: colors.text, minHeight: "100vh" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10, 14, 20, 0.85)",
          backdropFilter: "saturate(160%) blur(14px)",
          WebkitBackdropFilter: "saturate(160%) blur(14px)",
          borderBottom: `1px solid ${colors.panelBorder}`,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <RookLogo size={32} />
            <div>
              <div style={{ color: colors.text, fontWeight: 700, fontSize: 15 }}>Sentry Docs</div>
              <div style={{ color: colors.teal, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em" }}>
                DARK ROCK LABS
              </div>
            </div>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link href="/" style={{ color: colors.textMuted, fontSize: 14, textDecoration: "none" }}>
              ← Home
            </Link>
            <Link
              href="/login"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
                color: "#0A0E14",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 40,
          padding: "32px 28px 80px",
        }}
      >
        <aside style={{ position: "sticky", top: 80, alignSelf: "start", maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}>
          {groups.map((g) => (
            <div key={g.label} style={{ marginBottom: 24 }}>
              <div
                style={{
                  color: colors.textDim,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "Figtree, sans-serif",
                }}
              >
                {g.label}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {g.items.map((it) => {
                  const active = pathname === it.href;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        style={{
                          display: "block",
                          padding: "8px 12px",
                          borderRadius: 8,
                          textDecoration: "none",
                          color: active ? colors.tealLight : colors.textMuted,
                          fontSize: 14,
                          fontWeight: active ? 700 : 500,
                          background: active ? "rgba(0, 180, 166, 0.1)" : "transparent",
                          borderLeft: active ? `2px solid ${colors.teal}` : "2px solid transparent",
                        }}
                      >
                        {it.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <article style={{ minWidth: 0 }}>{children}</article>
      </div>
    </div>
  );
}
