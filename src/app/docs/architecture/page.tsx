import { DocTitle, Lead, H2, P, UL, LI, Code, Pre } from "@/components/docs/Prose";

export const metadata = { title: "Architecture · Sentry Docs" };

export default function ArchitectureDocs() {
  return (
    <>
      <DocTitle eyebrow="Reference">Architecture</DocTitle>
      <Lead>
        Sentry is a single-tenant Next.js application with a client-first state model and a thin
        Postgres-backed persistence layer. The architecture is intentionally simple so the IR team
        can read, modify, and operate it without surprises.
      </Lead>

      <H2 id="stack">Stack</H2>
      <UL>
        <LI><strong>Framework</strong> &mdash; Next.js 15 (App Router) on Node.js 20+</LI>
        <LI><strong>Language</strong> &mdash; TypeScript</LI>
        <LI><strong>UI</strong> &mdash; React 19, TailwindCSS, Lucide icons, Recharts</LI>
        <LI><strong>State</strong> &mdash; Zustand for all client state</LI>
        <LI><strong>Auth</strong> &mdash; NextAuth.js with a Credentials provider (single-user, bcrypt hash)</LI>
        <LI><strong>Database</strong> &mdash; PostgreSQL via Prisma 7</LI>
        <LI><strong>Drag &amp; drop</strong> &mdash; @dnd-kit (core, sortable, utilities)</LI>
      </UL>

      <H2 id="layout">Repository layout</H2>
      <Pre>{`src/
  app/
    page.tsx              -- public marketing homepage
    login/                -- credential sign-in form
    docs/                 -- this documentation site
    app/                  -- the application (gated by middleware)
    api/auth/[...nextauth]/route.ts
  components/
    marketing/            -- marketing site components
    docs/                 -- docs site components
    layout/               -- application Shell, Sidebar, Topbar
    ui/                   -- shared UI primitives + ModalProvider
    <module>/             -- one folder per application module
  lib/
    auth.ts               -- NextAuth options
    db.ts                 -- Prisma client
    notifications.ts      -- notification event service
    *-report-generator.ts -- assessment, incident, policy reports
  store/index.ts          -- Zustand store, all app state
  data/                   -- static reference data (CSF, playbooks, etc.)
  types/                  -- shared TS types
middleware.ts             -- gates /app/* behind authentication`}</Pre>

      <H2 id="auth">Authentication</H2>
      <P>
        The current phase uses a single credential pair stored as a bcrypt hash in <Code>.env</Code>. NextAuth
        validates the email and runs <Code>bcrypt.compare</Code> against the stored hash. Sessions are JWTs
        with an 8-hour TTL.
      </P>
      <P>
        Routing: the public homepage, <Code>/login</Code>, and <Code>/docs</Code> are all open. Everything under <Code>/app</Code> is
        gated by <Code>middleware.ts</Code>. Unauthenticated requests are redirected to <Code>/login</Code> with a callback URL.
      </P>

      <H2 id="state">State model</H2>
      <P>
        All UI state &mdash; current page, sidebar open/closed, theme mode, user role, onboarding status,
        active incident, ticket lists, etc. &mdash; is held in a single Zustand store at <Code>src/store/index.ts</Code>.
        Modules subscribe to the slices they need with <Code>useStore(s =&gt; s.something)</Code>.
      </P>

      <H2 id="data">Persistence</H2>
      <P>
        Long-lived data is modeled in <Code>prisma/schema.prisma</Code>: <Code>Organization</Code>, <Code>Assessment</Code>,
        <Code>Incident</Code>, <Code>Ticket</Code>, <Code>Task</Code>, <Code>Stakeholder</Code>, <Code>Policy</Code>, <Code>Tabletop</Code>,
        <Code>TeamMember</Code>, and <Code>ForensicLog</Code>. The Prisma client is generated to <Code>src/generated/prisma</Code>.
      </P>

      <H2 id="reports">Report generators</H2>
      <P>
        Three generators live in <Code>src/lib/</Code>:
      </P>
      <UL>
        <LI><Code>assessment-report-generator.ts</Code> &mdash; the NIST CSF 2.0 assessment export</LI>
        <LI><Code>incident-report-generator.ts</Code> &mdash; the post-incident report</LI>
        <LI><Code>policy-generator.ts</Code> &mdash; templated policy documents</LI>
      </UL>
    </>
  );
}
