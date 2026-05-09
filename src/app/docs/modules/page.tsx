import { DocTitle, Lead, H2, H3, P, UL, LI } from "@/components/docs/Prose";

export const metadata = { title: "Modules · Sentry Docs" };

const modules = [
  {
    name: "Dashboard",
    body: "Live posture and metrics across active incidents, open tickets, recent assessments, and stakeholder coverage. Real metrics &mdash; no fake demo data.",
  },
  {
    name: "Threat Intelligence",
    body: "CVE feeds, OSINT sources, and curated advisories. Cron-driven refresh with optional NVD API key.",
  },
  {
    name: "Onboarding",
    body: "Capture organization profile, tech stack, and applicable frameworks. Drives downstream policies, playbooks, and assessment context.",
  },
  {
    name: "Assessment",
    body: "NIST CSF 2.0 maturity assessment across all six functions. Group, category, and subcategory scores with prioritized recommendations and a polished export.",
  },
  {
    name: "IR Planner",
    body: "Build the incident response plan: phases, contact lists (core / extended / external), and per-phase checklists.",
  },
  {
    name: "Commander",
    body: "Live incident command. Real-time timer, SLA tickers, IOC tracking, affected users/assets/regions, attorney-client privilege markers, and auto-ticket creation.",
  },
  {
    name: "Incident Log",
    body: "Auto-discovered list of every incident with phase tracking, parent/child ticket relationships, and full timeline export.",
  },
  {
    name: "Playbooks",
    body: "Fourteen IR playbooks mapped to the IR phases (Detect, Analyze, Contain, Eradicate, Recover, Lessons Learned). Assignable to incidents in one click.",
  },
  {
    name: "Tabletop",
    body: "AAR Dashboard with threat profile, objectives scorecard, findings table, and a Light TTX exporter for fast, repeatable exercises.",
  },
  {
    name: "Pen Testing",
    body: "Scoping module covering six test types. Submission flow integrates with Dark Rock Security via mailto with the structured request.",
  },
  {
    name: "Tickets",
    body: "Parent and child tickets with severity, phase, assignee, action lists, and per-ticket details.",
  },
  {
    name: "Tasks",
    body: "Lightweight task tracking with assignments, statuses, and SLA awareness. Tasks are first-class artifacts of incidents and assessments.",
  },
  {
    name: "Forensics",
    body: "Evidence vault with SHA-256 hashing, chain of custody, and access control. Every action is logged for the report record.",
  },
  {
    name: "Stakeholders",
    body: "Maintain core, extended, and external stakeholders. Group-level permissions feed Access control.",
  },
  {
    name: "Policies",
    body: "Eight policy templates rendered with the organization&rsquo;s tech stack and brand. Export to a clean document.",
  },
  {
    name: "Communications",
    body: "Notification service with CONFIDENTIAL and PRIVILEGED headers, templated stakeholder updates, and timeline capture.",
  },
  {
    name: "Access",
    body: "Role-based access control aligned with the four user roles (viewer, analyst, manager, admin) and stakeholder group assignments. Least-privilege by default.",
  },
  {
    name: "Integrations",
    body: "Connectors for the organization&rsquo;s tech stack. Used by playbooks, assessment recommendations, and policy generation.",
  },
];

export default function ModulesDocs() {
  return (
    <>
      <DocTitle eyebrow="Reference">Modules</DocTitle>
      <Lead>
        Sentry ships with eighteen integrated modules. They share a single data model, so an incident
        flows across assessment, playbooks, tickets, evidence, and comms without re-keying.
      </Lead>

      <H2 id="all-modules">All modules</H2>
      <P>Click any module name in the application sidebar to open it. The list below is the full set:</P>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
        {modules.map((m) => (
          <section
            key={m.name}
            style={{
              padding: 20,
              borderRadius: 12,
              background: "#0F1623",
              border: "1px solid #1E293B",
            }}
          >
            <H3 id={m.name.toLowerCase().replace(/\s+/g, "-")}>{m.name}</H3>
            <P>
              <span dangerouslySetInnerHTML={{ __html: m.body }} />
            </P>
          </section>
        ))}
      </div>

      <H2 id="conventions">Cross-module conventions</H2>
      <UL>
        <LI>All client state lives in <strong>Zustand</strong> (<code>src/store/index.ts</code>).</LI>
        <LI>All static reference data (CSF controls, playbooks, IR phases) lives in <code>src/data/</code>.</LI>
        <LI>Report generators live in <code>src/lib/</code> and produce a single document object that&rsquo;s rendered to PDF/HTML.</LI>
        <LI>Notification events are dispatched through <code>src/lib/notifications.ts</code>.</LI>
      </UL>
    </>
  );
}
