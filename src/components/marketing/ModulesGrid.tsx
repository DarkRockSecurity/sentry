"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Radar,
  GraduationCap,
  ClipboardCheck,
  Map,
  Siren,
  ListTree,
  BookOpen,
  Sword,
  Bug,
  Ticket,
  CheckSquare,
  FileSearch,
  Users,
  FileText,
  Radio,
  Lock,
  Plug,
  X,
} from "lucide-react";
import { SectionHeader } from "./Capabilities";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelBorder: "#1E293B",
};

type Mod = {
  id: string;
  label: string;       // sidebar / card label
  note: string;        // grid-card subtext
  icon: typeof LayoutDashboard;
  file: string;        // screenshot filename
  hero: string;        // marketing headline
  tagline: string;     // marketing subhead
  description: string; // 2-3 sentences of value prop
  highlights: string[];// 3-4 numbered callouts
};

const mods: Mod[] = [
  {
    id: "dashboard", label: "Dashboard", note: "Live posture & metrics", icon: LayoutDashboard, file: "dashboard.png",
    hero: "Your cyber resilience cockpit",
    tagline: "Three categories. One glance. Every answer.",
    description: "Active operations, performance & exposure, and readiness — surfaced in three color-coded categories so the SOC, the CISO, and the board each find what they need without scrolling. Every tile is clickable; nothing is buried two screens deep.",
    highlights: [
      "MTTD and MTTR computed live from your incident log — 60s tolerance built in",
      "Zero-day alerts surface critical CVEs the moment your industry feed picks them up",
      "Industry threat pulse alongside the global feed, scoped to your sector",
      "Active-incident banner with one-click Commander — never lose the ball mid-event",
    ],
  },
  {
    id: "threatintel", label: "Threat Intel", note: "CVE & OSINT feeds", icon: Radar, file: "threatintel.png",
    hero: "Threat intelligence, sized for you",
    tagline: "Global feeds + your industry's critical advisories — pre-scored and prioritized.",
    description: "Rather than dumping every CVE on your desk, Sentry blends CVSS, exploitation status, and your tech stack to surface the threats that are actually you. MITRE ATT&CK mapping is on every advisory, and one click promotes it into the response workflow.",
    highlights: [
      "Industry-scoped feed cuts noise by 80% on day one",
      "Risk scoring blends CVSS, active exploitation, and zero-day flags",
      "MITRE ATT&CK technique mapping out of the box",
      "Verified exploit auto-declares the incident in Commander",
    ],
  },
  {
    id: "onboard", label: "Onboarding", note: "Org & tech profile", icon: GraduationCap, file: "onboard.png",
    hero: "From zero to operational, fast",
    tagline: "A guided setup that already knows what your assessment will need next.",
    description: "Capture the org profile, tech stack, and applicable frameworks in one pass. Every downstream module — assessment, playbooks, policy generation, threat-intel filtering — uses this profile so you don't repeat yourself.",
    highlights: [
      "10-field tech stack inventory feeds smart questions in the assessment",
      "Compliance flags drive automatic regulatory deadline tracking",
      "Re-runnable: tech stack changes propagate through all modules instantly",
      "Less than five minutes to a fully personalized platform",
    ],
  },
  {
    id: "assessment", label: "Assessment", note: "NIST CSF 2.0 maturity", icon: ClipboardCheck, file: "assessment.png",
    hero: "Maturity, measured against NIST CSF 2.0",
    tagline: "The only resilience assessment that hands you a 90-day plan, not slideware.",
    description: "Six CSF functions, every category, every subcategory — assessed with smart-question prompts that read your tech stack. Every saved assessment generates a Resilience Hitlist with short-term, achievable, and aspirational moves, flagged for what your current tooling can automate.",
    highlights: [
      "Resilience Hitlist: short-term wins, achievable bets, aspirational moves",
      "Automation flags surface what's a config flip vs a quarter-long project",
      "Saved-assessment history with delta scoring shows real maturity progression",
      "Board-ready PDF export plus one-click email delivery to leadership",
    ],
  },
  {
    id: "irplan", label: "IR Planner", note: "Plans & contacts", icon: Map, file: "irplan.png",
    hero: "An IR plan you'll actually run",
    tagline: "Phase-by-phase readiness with named owners and live checklists.",
    description: "Sentry replaces the 40-page IR runbook PDF with a working checklist that lives next to the incident. Phase progression is tracked, owners are pinned, and your readiness percentage feeds the dashboard automatically.",
    highlights: [
      "Pre-built nine-phase IR lifecycle aligned to NIST 800-61",
      "Stakeholder contacts pinned to each phase — no scrambling for numbers",
      "Per-step notes and checklists captured during exercises and real events",
      "Readiness % surfaces on the dashboard so it's never out of sight",
    ],
  },
  {
    id: "commander", label: "Commander", note: "Live incident command", icon: Siren, file: "commander.png",
    hero: "When it's an incident, command it",
    tagline: "One screen for the full incident lifecycle. Privileged-by-default.",
    description: "Sentry's Commander turns the moment of declaration into a live operational picture: real-time timer, SLA tickers per stakeholder tier, IOC tracking, affected users/assets/regions, attorney-client privilege one-click engagement, and battle rhythm cadence built in.",
    highlights: [
      "Real-time SLA tickers across every notification group, tier-aware",
      "IOCs, affected users, assets, and regions captured in one structured view",
      "Attorney-Client privilege engaged with one toggle, propagated everywhere",
      "Auto-creates child tickets and tasks as the incident unfolds",
    ],
  },
  {
    id: "incidentlog", label: "Incident Log", note: "All incidents, all phases", icon: ListTree, file: "incidentlog.png",
    hero: "Every incident, fully reconstructed",
    tagline: "Auto-curated history with phases, ticket trees, and timeline reconstruction.",
    description: "When the auditor asks how the Q1 phishing campaign was handled, the answer is one click. Every incident's master ticket, child workstreams, full timeline, IOCs, and findings are preserved with chain-of-custody intact.",
    highlights: [
      "Master + child ticket relationships preserved across years",
      "Full timeline of every event, action, and decision",
      "Status filters and search — find the 2024 ransomware incident in seconds",
      "MTTD and MTTR computed automatically per incident and rolled up",
    ],
  },
  {
    id: "playbooks", label: "Playbooks", note: "14 IR playbooks", icon: BookOpen, file: "playbooks.png",
    hero: "Fourteen playbooks. One click to run.",
    tagline: "Pre-mapped to IR phases. Assign to an incident and the queue populates.",
    description: "Don't write playbooks during an incident. Sentry ships fourteen scenario-tested playbooks — ransomware, BEC, insider threat, supply chain, cloud account compromise, and more — each mapped to the IR lifecycle and ready to attach to a live case.",
    highlights: [
      "14 playbooks across phishing, ransomware, insider, cloud, supply chain, more",
      "One-click attachment auto-creates phase-tagged tasks",
      "Each step is reusable and editable — build your own variant from any base",
      "Ties directly into the Tabletop module for low-friction exercise generation",
    ],
  },
  {
    id: "tabletop", label: "Tabletop", note: "AAR & Light TTX", icon: Sword, file: "tabletop.png",
    hero: "Stress-test before the breach does",
    tagline: "AAR Dashboard, threat profiles, and the Light TTX exporter.",
    description: "Run tabletop exercises in less than an hour, capture findings as you go, and convert lessons learned into real tasks. Every exercise produces a Light TTX export your auditors and insurers will recognize.",
    highlights: [
      "Threat profile generator pulls from your industry's actual TTPs",
      "Objectives scorecard turns 'we discussed it' into 'we measured it'",
      "Findings convert directly into tasks — no transcription gap",
      "Light TTX export format aligns with HITRUST, HIPAA, and SOC 2 expectations",
    ],
  },
  {
    id: "pentesting", label: "Pen Testing", note: "Scoping & engagement", icon: Bug, file: "pentesting.png",
    hero: "Pen testing, scoped and tracked",
    tagline: "Six test types, scoping form to engagement to findings — all one thread.",
    description: "Submit a pen test request from inside Sentry and it hits the Dark Rock IR desk by email automatically. Scoping, pricing, approval, active testing, and finding remediation all live in one tracked workspace until every issue is closed.",
    highlights: [
      "Six test types: external, internal, web app, wireless, social, red team",
      "Scoping form pre-loads from your tech stack — fewer back-and-forth emails",
      "Findings track from Open through Remediated with severity + CVSS scoring",
      "Pricing, approval, and reports all preserved in the engagement timeline",
    ],
  },
  {
    id: "tickets", label: "Tickets", note: "Parent / child tickets", icon: Ticket, file: "tickets.png",
    hero: "Parent. Child. Done.",
    tagline: "Hierarchical tickets that scale from a single event to a full incident workstream.",
    description: "Sentry's ticket model is built for IR specifically: a master ticket per incident, child tickets per workstream, security-event tickets from threat-intel feeds, and parent–child relationships preserved through the entire lifecycle.",
    highlights: [
      "Master / child / security-event ticket types built for IR triage",
      "Auto-creates child tickets from playbook steps and threat-intel hits",
      "Phase-aware status flow ties each ticket to its IR lifecycle stage",
      "Bulk operations and queue filters keep the SOC moving fast",
    ],
  },
  {
    id: "tasks", label: "Tasks", note: "Assignments & SLAs", icon: CheckSquare, file: "tasks.png",
    hero: "Kanban for what matters under fire",
    tagline: "Four columns, IR-phase tagged, auto-linked to tickets.",
    description: "When an incident generates twenty parallel actions, you don't need a project tool — you need a triage board. Sentry's task module is purpose-built for IR throughput: drag, assign, set priority, see what's blocking.",
    highlights: [
      "Backlog · In Progress · In Review · Done — purpose-built for IR cadence",
      "Auto-creates from playbooks, hitlist items, and tabletop findings",
      "IR-phase tagging keeps tasks aligned to the lifecycle",
      "Critical/High counts roll up to the dashboard automatically",
    ],
  },
  {
    id: "forensics", label: "Forensics", note: "Evidence vault", icon: FileSearch, file: "forensics.png",
    hero: "Evidence with chain of custody by default",
    tagline: "SHA-256 hashed. Access-controlled. Exportable when the regulators ask.",
    description: "The forensics module is what insurance and counsel actually want during a breach: cryptographically hashed evidence, named chain of custody, role-based access lists, and an audit trail every action writes to automatically.",
    highlights: [
      "SHA-256 hashing on every file, verified on read and export",
      "Per-evidence access list with role-based gating",
      "Chain of custody auto-captured — every view, edit, and export logged",
      "Privilege & Confidentiality classification surfaces in every export",
    ],
  },
  {
    id: "stakeholders", label: "Stakeholders", note: "Core / Extended / External", icon: Users, file: "stakeholders.png",
    hero: "Everyone who matters, organized",
    tagline: "Internal + external + 22 IR-vendor categories with onboarding readiness scoring.",
    description: "Sentry's stakeholders module is the directory you actually update. Tabbed sub-navigation separates Internal, External, Vendors (22 IR-relevant categories with descriptions), and an Onboarding readiness scorecard so you know exactly which roles still need a name.",
    highlights: [
      "22 IR vendor categories — EDR, SIEM, Identity, M365, DFIR retainer, more",
      "Pre-populated Dark Rock IR partner card for instant retainer access",
      "Onboarding scorecard quantifies stakeholder coverage as a percentage",
      "Per-category descriptions explain why each role matters during IR",
    ],
  },
  {
    id: "policies", label: "Policies", note: "8 policy templates", icon: FileText, file: "policies.png",
    hero: "Policies that don't just live in a binder",
    tagline: "Eight templates rendered to your stack and brand. Exportable. Auditable.",
    description: "Sentry generates policy documents that reference your actual tech stack, your stakeholders, and your regulatory commitments — not generic boilerplate. Every generation is logged, versioned, and exportable in a format your auditors will read.",
    highlights: [
      "8 policy templates including Incident Response, Acceptable Use, Vendor Risk",
      "Auto-fills tech stack, stakeholder names, and compliance requirements",
      "Versioned exports — show auditors the v1.2 you used in March",
      "Brand-aligned typography and logos baked in for board distribution",
    ],
  },
  {
    id: "comms", label: "Communications", note: "Notifications & headers", icon: Radio, file: "comms.png",
    hero: "Privileged. Confidential. Logged.",
    tagline: "Out-of-band channel inventory with privilege-by-default classification.",
    description: "When the email infrastructure might be the compromise, you need an out-of-band plan. Sentry inventories Signal, satellite, in-person EOC, and the rest — alongside privileged communications routing that classifies every message correctly.",
    highlights: [
      "Out-of-band channel inventory ready before the incident",
      "Privilege & Confidentiality banners auto-attach to every notification",
      "One-click Send Email path through verified SMTP delivery",
      "Communication log preserved with full timestamp + recipient audit",
    ],
  },
  {
    id: "access", label: "Access Control", note: "RBAC & groups", icon: Lock, file: "access.png",
    hero: "Least privilege, by default",
    tagline: "Four roles. Stakeholder-group permissions. Tenant-scoped from the schema up.",
    description: "Sentry's access model is built for IR responsibilities, not generic permissions. Super-admin, tenant-admin, analyst, and viewer roles map cleanly to the actual workflows, with stakeholder-group assignments giving fine control without policy sprawl.",
    highlights: [
      "Four IR-aligned roles — super-admin, tenant-admin, analyst, viewer",
      "Stakeholder-group assignments grant module-level access without complexity",
      "Tenant isolation enforced at the database (row-level security) layer",
      "Provisioning + deprovisioning flow built into the admin console",
    ],
  },
  {
    id: "integrations", label: "Integrations", note: "Stack connectors", icon: Plug, file: "integrations.png",
    hero: "Plug into your stack",
    tagline: "EDR, SIEM, IdP, M365, cloud, ticketing — registered, contactable, ready.",
    description: "Sentry doesn't replace your security stack — it makes it actionable during an incident. Every vendor's portal, support tier, SLA, and 24×7 hotline is one click away when you need it most.",
    highlights: [
      "22 vendor categories cover the full IR-relevant stack",
      "Support portals, account IDs, and SLAs surfaced inline during incidents",
      "Pre-approved IR retainer (Dark Rock) wired to the active incident",
      "Per-vendor primary flag identifies your default for each category",
    ],
  },
];

export function ModulesGrid() {
  const [active, setActive] = useState<Mod | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section id="modules" style={{ padding: "88px 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Modules"
          title="Eighteen modules. One workspace."
          subtitle="Click any module to see what it does for your team — with hero callouts and the screenshot from the live product."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
            marginTop: 48,
          }}
        >
          {mods.map((m) => (
            <Card key={m.id} mod={m} onClick={() => setActive(m)} />
          ))}
        </div>
      </div>

      {active && <Lightbox mod={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function Card({ mod, onClick }: { mod: Mod; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const Icon = mod.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Open ${mod.label} preview`}
      style={{
        textAlign: "left",
        padding: 0,
        background: colors.panel,
        border: `1px solid ${hover ? "rgba(0,180,166,0.45)" : colors.panelBorder}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hover ? "0 18px 40px rgba(0, 180, 166, 0.18)" : "0 1px 0 rgba(0,0,0,0)",
        width: "100%",
        fontFamily: "inherit",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 24, padding: "0 10px", background: "#0A0E14",
          borderBottom: `1px solid ${colors.panelBorder}`,
          display: "flex", alignItems: "center", gap: 5,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F56565" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ECC94B" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#48BB78" }} />
      </div>

      <div style={{ position: "relative", aspectRatio: "16 / 9", background: "#080C12", overflow: "hidden" }}>
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/marketing/screenshots/${mod.file}`}
            alt={mod.label}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top",
              transform: hover ? "scale(1.03)" : "scale(1)", transition: "transform 0.45s ease",
            }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textDim, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
            preview unavailable
          </div>
        )}
        <div
          style={{
            position: "absolute", top: 10, right: 10,
            padding: "4px 9px", borderRadius: 6,
            background: hover ? "rgba(0, 180, 166, 0.95)" : "rgba(10, 14, 20, 0.78)",
            color: hover ? "#0A0E14" : colors.textMuted,
            fontFamily: "Figtree, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            transition: "background 0.18s, color 0.18s",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          }}
        >
          LEARN MORE →
        </div>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0, 180, 166, 0.1)",
            border: `1px solid rgba(0, 180, 166, 0.28)`,
            color: colors.teal, flexShrink: 0,
          }}
        >
          <Icon size={17} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: colors.text, fontFamily: "Figtree, sans-serif", fontSize: 14, fontWeight: 700 }}>{mod.label}</div>
          <div style={{ color: colors.textMuted, fontSize: 12.5, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.note}</div>
        </div>
      </div>
    </button>
  );
}

function Lightbox({ mod, onClose }: { mod: Mod; onClose: () => void }) {
  const Icon = mod.icon;
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${mod.label} preview`}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(8, 12, 18, 0.94)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 32, overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%", maxWidth: 1280,
          background: colors.panel,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.55)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close preview"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 2,
            width: 36, height: 36, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(10, 14, 20, 0.88)",
            border: `1px solid ${colors.panelBorder}`,
            color: colors.text, cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>

        {/* Hero */}
        <div
          style={{
            padding: "32px 36px 20px",
            background: "linear-gradient(135deg, rgba(0, 180, 166, 0.16) 0%, rgba(0, 180, 166, 0.02) 60%, transparent 100%)",
            borderBottom: `1px solid ${colors.panelBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: "linear-gradient(135deg, #00B4A6, #009A8E)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0A0E14", boxShadow: "0 6px 20px rgba(0,180,166,0.3)",
                flexShrink: 0,
              }}
            >
              <Icon size={24} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: colors.tealLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "Figtree, sans-serif" }}>
                {mod.label.toUpperCase()}
              </div>
              <h2 style={{
                fontFamily: "Figtree, sans-serif",
                fontSize: "clamp(24px, 3.4vw, 36px)",
                fontWeight: 800,
                color: colors.text,
                margin: "4px 0 0",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}>{mod.hero}</h2>
            </div>
          </div>
          <p style={{
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: 17, color: colors.textMuted, lineHeight: 1.55, margin: 0, maxWidth: 820,
          }}>{mod.tagline}</p>
        </div>

        {/* Body: 2-column on desktop, stacked on mobile */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 0,
          }}
          className="lightbox-grid"
        >
          {/* Screenshot */}
          <div style={{ background: "#080C12", padding: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${colors.panelBorder}` }}>
            <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${colors.panelBorder}`, background: "#0A0E14" }}>
              <div style={{ height: 24, padding: "0 10px", background: "#0A0E14", borderBottom: `1px solid ${colors.panelBorder}`, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F56565" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ECC94B" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#48BB78" }} />
                <span style={{ marginLeft: 12, color: colors.textMuted, fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>
                  sentry / {mod.label.toLowerCase().replace(/\s+/g, "-")}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/marketing/screenshots/${mod.file}`}
                alt={mod.label}
                style={{ display: "block", width: "100%", height: "auto", background: "#080C12" }}
              />
            </div>
          </div>

          {/* Marketing copy + highlights */}
          <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{
              fontFamily: "Source Sans 3, sans-serif",
              fontSize: 14.5, lineHeight: 1.6, color: colors.text, margin: 0,
            }}>
              {mod.description}
            </p>

            <div>
              <div style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "Figtree, sans-serif", marginBottom: 10 }}>
                What you get
              </div>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {mod.highlights.map((h, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 22, height: 22, borderRadius: "50%",
                        background: colors.teal + "1F",
                        border: `1px solid ${colors.teal}55`,
                        color: colors.tealLight,
                        fontSize: 11, fontWeight: 800, fontFamily: "JetBrains Mono, monospace",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: colors.text, fontSize: 13, lineHeight: 1.55, fontFamily: "Source Sans 3, sans-serif" }}>{h}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* CTA footer */}
        <div
          style={{
            padding: "20px 32px",
            borderTop: `1px solid ${colors.panelBorder}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            background: "rgba(0, 180, 166, 0.04)",
          }}
        >
          <div style={{ color: colors.textMuted, fontSize: 12, fontFamily: "Figtree, sans-serif" }}>
            See {mod.label} working with your data — sign in or talk to us about a guided demo.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/login"
              style={{
                padding: "10px 20px",
                borderRadius: 9,
                background: `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
                color: "#0A0E14",
                fontWeight: 700, fontSize: 13,
                textDecoration: "none",
                fontFamily: "Figtree, sans-serif",
                boxShadow: "0 4px 16px rgba(0,180,166,0.28)",
              }}
            >
              Sign in →
            </Link>
            <a
              href="mailto:contact@darkrocksecurity.com?subject=Sentry%20demo"
              style={{
                padding: "10px 20px",
                borderRadius: 9,
                background: "rgba(255, 255, 255, 0.04)",
                color: colors.text,
                fontWeight: 600, fontSize: 13,
                textDecoration: "none",
                border: `1px solid ${colors.panelBorder}`,
                fontFamily: "Figtree, sans-serif",
              }}
            >
              Talk to us
            </a>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .lightbox-grid { grid-template-columns: 1fr !important; }
            .lightbox-grid > div:first-child { border-right: none !important; border-bottom: 1px solid ${colors.panelBorder} !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
