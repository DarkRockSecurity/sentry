"use client";

import { useColors } from "@/lib/theme";
import { font, weight, space } from "@/lib/typography";

interface SectionHeaderProps {
  children: React.ReactNode;
  sub?: string;
}

export function SectionHeader({ children, sub }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <div style={{ marginBottom: space.xl, paddingBottom: space.md, borderBottom: `1px solid ${colors.panelBorder}` }}>
      <h2 style={{ color: colors.white, fontSize: font.h1, fontWeight: weight.bold, margin: 0, letterSpacing: "-0.01em" }}>{children}</h2>
      {sub && (
        <p style={{ color: colors.textMuted, fontSize: font.bodySm, margin: `${space.xxs}px 0 0`, lineHeight: 1.5, maxWidth: "80ch" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
