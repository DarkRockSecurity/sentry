import { DocTitle, Lead, H2, P, UL, LI, Code } from "@/components/docs/Prose";

export const metadata = { title: "Brand & theming · Sentry Docs" };

const swatches = [
  { name: "Aurora Teal", hex: "#00B4A6", desc: "Primary brand color." },
  { name: "Aurora Teal Dark", hex: "#009A8E", desc: "Hover / pressed states." },
  { name: "Aurora Teal Light", hex: "#33C4B8", desc: "Highlights, gradient end-stop." },
  { name: "Deep Obsidian", hex: "#0A0E14", desc: "Page background." },
  { name: "Obsidian Light", hex: "#0F1520", desc: "Section backgrounds." },
  { name: "Panel", hex: "#0F1623", desc: "Card and panel surfaces." },
  { name: "Panel Border", hex: "#1E293B", desc: "Subtle dividers." },
  { name: "Text", hex: "#E2E8F0", desc: "Primary text." },
  { name: "Text Muted", hex: "#94A3B8", desc: "Secondary text." },
];

export default function BrandDocs() {
  return (
    <>
      <DocTitle eyebrow="Reference">Brand &amp; theming</DocTitle>
      <Lead>
        Sentry&rsquo;s identity is built around a single brand color (Aurora Teal) on Deep Obsidian.
        Restrained, monitored, calm &mdash; the visual language matches the operational reality of incident command.
      </Lead>

      <H2 id="palette">Palette</H2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {swatches.map((s) => (
          <div
            key={s.hex}
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#0F1623",
              border: "1px solid #1E293B",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 56,
                borderRadius: 8,
                background: s.hex,
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 10,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#E2E8F0", fontFamily: "Figtree, sans-serif", fontWeight: 700, fontSize: 13 }}>
                {s.name}
              </span>
              <span style={{ color: "#94A3B8", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{s.hex}</span>
            </div>
            <div style={{ color: "#64748B", fontSize: 12, marginTop: 6 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <H2 id="typography">Typography</H2>
      <UL>
        <LI><strong>Display</strong> &mdash; Figtree (headings, UI, buttons)</LI>
        <LI><strong>Body</strong> &mdash; Source Sans 3 (long-form prose)</LI>
        <LI><strong>Mono</strong> &mdash; JetBrains Mono (code, IDs, terminal-feel labels)</LI>
      </UL>

      <H2 id="logo">Logo</H2>
      <P>
        The Sentry mark is a chess rook in Deep Obsidian on a teal gradient plate. Always preserve the
        plate when placing the mark on dark backgrounds. The wordmark <strong>Sentry</strong> sits to the right
        of the plate, with the eyebrow <strong>DARK ROCK LABS</strong> beneath it in Aurora Teal at 9-10px,
        spaced at 0.18em.
      </P>

      <H2 id="usage">Usage in code</H2>
      <P>
        Static colors live in <Code>src/lib/tokens.ts</Code>. Theme-aware colors live in <Code>src/lib/theme.ts</Code>
        and are read via <Code>useColors()</Code> inside React components. The marketing and docs sites use
        the static tokens directly because they are dark-only.
      </P>
    </>
  );
}
