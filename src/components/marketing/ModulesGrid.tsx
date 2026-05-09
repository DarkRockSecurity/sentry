"use client";

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
  panel: "#0F1623",
  panelBorder: "#1E293B",
};

type Mod = {
  id: string;
  label: string;
  note: string;
  icon: typeof LayoutDashboard;
  file: string;
};

const mods: Mod[] = [
  { id: "dashboard", label: "Dashboard", note: "Live posture & metrics", icon: LayoutDashboard, file: "dashboard.png" },
  { id: "threatintel", label: "Threat Intel", note: "CVE & OSINT feeds", icon: Radar, file: "threatintel.png" },
  { id: "onboard", label: "Onboarding", note: "Org & tech profile", icon: GraduationCap, file: "onboard.png" },
  { id: "assessment", label: "Assessment", note: "NIST CSF 2.0 maturity", icon: ClipboardCheck, file: "assessment.png" },
  { id: "irplan", label: "IR Planner", note: "Plans & contacts", icon: Map, file: "irplan.png" },
  { id: "commander", label: "Commander", note: "Live incident command", icon: Siren, file: "commander.png" },
  { id: "incidentlog", label: "Incident Log", note: "All incidents, all phases", icon: ListTree, file: "incidentlog.png" },
  { id: "playbooks", label: "Playbooks", note: "14 IR playbooks", icon: BookOpen, file: "playbooks.png" },
  { id: "tabletop", label: "Tabletop", note: "AAR & Light TTX", icon: Sword, file: "tabletop.png" },
  { id: "pentesting", label: "Pen Testing", note: "Scoping & engagement", icon: Bug, file: "pentesting.png" },
  { id: "tickets", label: "Tickets", note: "Parent / child tickets", icon: Ticket, file: "tickets.png" },
  { id: "tasks", label: "Tasks", note: "Assignments & SLAs", icon: CheckSquare, file: "tasks.png" },
  { id: "forensics", label: "Forensics", note: "Evidence vault", icon: FileSearch, file: "forensics.png" },
  { id: "stakeholders", label: "Stakeholders", note: "Core / Extended / External", icon: Users, file: "stakeholders.png" },
  { id: "policies", label: "Policies", note: "8 policy templates", icon: FileText, file: "policies.png" },
  { id: "comms", label: "Communications", note: "Notifications & headers", icon: Radio, file: "comms.png" },
  { id: "access", label: "Access Control", note: "RBAC & groups", icon: Lock, file: "access.png" },
  { id: "integrations", label: "Integrations", note: "Stack connectors", icon: Plug, file: "integrations.png" },
];

export function ModulesGrid() {
  const [active, setActive] = useState<Mod | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
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
          subtitle="Every module shares the same data model — incidents, tickets, evidence, stakeholders, and timelines flow between them without re-keying. Click any module to see it in action."
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
          height: 24,
          padding: "0 10px",
          background: "#0A0E14",
          borderBottom: `1px solid ${colors.panelBorder}`,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F56565" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ECC94B" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#48BB78" }} />
      </div>

      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: "#080C12",
          overflow: "hidden",
        }}
      >
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/marketing/screenshots/${mod.file}`}
            alt={mod.label}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "left top",
              transform: hover ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.45s ease",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.textDim,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
            }}
          >
            preview unavailable
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "4px 9px",
            borderRadius: 6,
            background: hover ? "rgba(0, 180, 166, 0.95)" : "rgba(10, 14, 20, 0.78)",
            color: hover ? "#0A0E14" : colors.textMuted,
            fontFamily: "Figtree, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            transition: "background 0.18s, color 0.18s",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          VIEW →
        </div>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 180, 166, 0.1)",
            border: `1px solid rgba(0, 180, 166, 0.28)`,
            color: colors.teal,
            flexShrink: 0,
          }}
        >
          <Icon size={17} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: colors.text,
              fontFamily: "Figtree, sans-serif",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {mod.label}
          </div>
          <div
            style={{
              color: colors.textMuted,
              fontSize: 12.5,
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {mod.note}
          </div>
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
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(8, 12, 18, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 1280,
          width: "100%",
          maxHeight: "calc(100vh - 64px)",
          background: colors.panel,
          border: `1px solid ${colors.panelBorder}`,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close preview"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            width: 36,
            height: 36,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10, 14, 20, 0.88)",
            border: `1px solid ${colors.panelBorder}`,
            color: colors.text,
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            background: "#080C12",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/marketing/screenshots/${mod.file}`}
            alt={mod.label}
            style={{ display: "block", width: "100%", height: "auto", maxHeight: "100%", objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${colors.panelBorder}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0, 180, 166, 0.1)",
              border: `1px solid rgba(0, 180, 166, 0.28)`,
              color: colors.teal,
              flexShrink: 0,
            }}
          >
            <Icon size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: colors.text, fontFamily: "Figtree, sans-serif", fontSize: 17, fontWeight: 800 }}>
              {mod.label}
            </div>
            <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>{mod.note}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              color: colors.textDim,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            ESC TO CLOSE
          </div>
        </div>
      </div>
    </div>
  );
}
