"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RookLogo } from "@/components/marketing/RookLogo";

const colors = {
  obsidian: "#0A0E14",
  obsidianL: "#0F1520",
  obsidianM: "#151C28",
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelBorder: "#1E293B",
  red: "#EF4444",
};

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tenants", label: "Tenants" },
  { href: "/admin/tenants/new", label: "Onboard new", emphasis: true },
  { href: "/admin/demo", label: "Demo" },
];

export function AdminShell({ children, userEmail }: { children: ReactNode; userEmail: string }) {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.obsidian, color: colors.text, fontFamily: "Source Sans 3, sans-serif" }}>
      <aside
        style={{
          width: 240,
          background: colors.obsidianL,
          borderRight: `1px solid ${colors.panelBorder}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 14px", borderBottom: `1px solid ${colors.panelBorder}`, textDecoration: "none" }}>
          <RookLogo size={36} />
          <div>
            <div style={{ color: colors.text, fontWeight: 700, fontSize: 14, fontFamily: "Figtree, sans-serif" }}>Sentry</div>
            <div style={{ color: colors.red, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em" }}>SUPER ADMIN</div>
          </div>
        </Link>

        <nav style={{ padding: 8, flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 7,
                  textDecoration: "none",
                  color: active ? colors.teal : item.emphasis ? colors.tealLight : colors.text,
                  fontSize: 13,
                  fontWeight: active ? 700 : item.emphasis ? 700 : 500,
                  background: active ? colors.teal + "1A" : item.emphasis ? colors.teal + "0F" : "transparent",
                  border: `1px solid ${active ? colors.teal + "55" : item.emphasis ? colors.teal + "33" : "transparent"}`,
                  marginBottom: 3,
                  fontFamily: "Figtree, sans-serif",
                }}
              >
                {item.emphasis ? "+ " : ""}{item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 14, borderTop: `1px solid ${colors.panelBorder}` }}>
          <div style={{ fontSize: 10, color: colors.textDim, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>SIGNED IN AS</div>
          <div style={{ color: colors.text, fontSize: 12, marginBottom: 10, wordBreak: "break-all" }}>{userEmail}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/app" style={{ flex: 1, textAlign: "center", padding: "7px 8px", fontSize: 11, color: colors.text, border: `1px solid ${colors.panelBorder}`, borderRadius: 6, textDecoration: "none", background: colors.panel }}>
              Tenant view →
            </Link>
            <form action="/auth/signout" method="post" style={{ flex: 1 }}>
              <button type="submit" style={{ width: "100%", padding: "7px 8px", fontSize: 11, color: colors.textMuted, border: `1px solid ${colors.panelBorder}`, borderRadius: 6, background: colors.panel, cursor: "pointer", fontFamily: "inherit" }}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, maxWidth: 1280 }}>{children}</main>
    </div>
  );
}
