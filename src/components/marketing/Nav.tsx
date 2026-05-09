"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RookLogo } from "./RookLogo";

const colors = {
  obsidian: "#0A0E14",
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  teal: "#00B4A6",
  panelBorder: "#1E293B",
};

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(160%) blur(14px)",
        WebkitBackdropFilter: "saturate(160%) blur(14px)",
        background: scrolled ? "rgba(10, 14, 20, 0.78)" : "rgba(10, 14, 20, 0.4)",
        borderBottom: `1px solid ${scrolled ? colors.panelBorder : "transparent"}`,
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <RookLogo size={36} />
          <div>
            <div style={{ color: colors.text, fontWeight: 700, fontSize: 16, fontFamily: "Figtree, sans-serif" }}>
              Sentry
            </div>
            <div style={{ color: colors.teal, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em" }}>
              DARK ROCK LABS
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#capabilities" style={navLink}>Capabilities</a>
          <a href="#modules" style={navLink}>Modules</a>
          <a href="#how" style={navLink}>How it works</a>
          <Link href="/docs" style={navLink}>Docs</Link>
          <Link
            href="/login"
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
              color: "#0A0E14",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              boxShadow: "0 2px 12px rgba(0, 180, 166, 0.28)",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}

const navLink: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  fontFamily: "Figtree, sans-serif",
};
