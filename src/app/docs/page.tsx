import Link from "next/link";
import { DocTitle, Lead, H2, P, UL, LI, Code } from "@/components/docs/Prose";

export const metadata = { title: "Overview · Sentry Docs" };

export default function DocsIndex() {
  return (
    <>
      <DocTitle eyebrow="Documentation">Welcome to Sentry</DocTitle>
      <Lead>
        Sentry is the cyber resilience platform built by Dark Rock Labs. These docs cover the platform&rsquo;s
        capabilities, architecture, and the conventions you&rsquo;ll work with day-to-day.
      </Lead>

      <H2>What Sentry is</H2>
      <P>
        Sentry unifies the things that an incident response team typically scatters across spreadsheets,
        runbooks, ticket queues, and chat threads. It is a single-tenant workspace built around the
        full lifecycle of cyber resilience &mdash; assess, prepare, respond &mdash; with eighteen integrated
        modules sharing one data model.
      </P>

      <H2>How the docs are organized</H2>
      <UL>
        <LI>
          <strong>Get started</strong> &mdash; install, configure, and sign in.
        </LI>
        <LI>
          <strong>Reference</strong> &mdash; every module explained, plus architecture and theming notes.
        </LI>
      </UL>

      <H2>Quick links</H2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <QuickLink href="/docs/getting-started" title="Getting started" body="Install dependencies and sign in." />
        <QuickLink href="/docs/modules" title="Modules" body="Eighteen integrated modules, one workspace." />
        <QuickLink href="/docs/architecture" title="Architecture" body="Stack, state, and data flow." />
        <QuickLink href="/docs/brand" title="Brand &amp; theming" body="Aurora Teal, Deep Obsidian, fonts." />
      </div>

      <H2>Conventions</H2>
      <P>Configuration is loaded from <Code>.env</Code>. The platform runs on Next.js 15 (App Router) with TypeScript, Tailwind, and Prisma.</P>
    </>
  );
}

function QuickLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "16px 18px",
        borderRadius: 12,
        background: "#0F1623",
        border: "1px solid #1E293B",
        textDecoration: "none",
      }}
    >
      <div style={{ color: "#E2E8F0", fontFamily: "Figtree, sans-serif", fontWeight: 700, fontSize: 14 }}>{title} →</div>
      <div style={{ color: "#94A3B8", fontSize: 13, marginTop: 4 }}>{body}</div>
    </Link>
  );
}
