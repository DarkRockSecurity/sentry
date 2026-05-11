"use client";

import { useState } from "react";
import { useColors } from "@/lib/theme";
import { Badge, Button, Card, SectionHeader, useModal } from "@/components/ui";
import { sendNotificationEmail } from "@/app/app/_actions";
import { useStore } from "@/store";

interface RoadmapItem {
  n: string;
  i: string;
  category: "SIEM/SOAR" | "Endpoint" | "Identity" | "GRC" | "Ticketing" | "Threat Intel" | "Productivity";
  vendors: string[];
  desc: string;
  eta: "Q3 2026" | "Q4 2026" | "2027";
}

const ROADMAP: RoadmapItem[] = [
  { n: "SIEM",        i: "📊", category: "SIEM/SOAR",   vendors: ["Splunk", "Sentinel", "QRadar", "Elastic"], desc: "Bi-directional alert + event ingest. Sentry incidents auto-populate from SIEM alerts; tickets sync back as notable events.", eta: "Q3 2026" },
  { n: "EDR / XDR",   i: "🛡️", category: "Endpoint",    vendors: ["CrowdStrike", "Defender", "SentinelOne", "Cortex"], desc: "Pull detection telemetry into the Incident Commander; trigger host containment from Sentry response actions.", eta: "Q3 2026" },
  { n: "Identity",    i: "🪪", category: "Identity",    vendors: ["Okta", "Entra ID", "Ping"], desc: "Disable users, revoke sessions, and force MFA re-enrollment as one-click containment steps in playbooks.", eta: "Q4 2026" },
  { n: "SOAR",        i: "⚙️", category: "SIEM/SOAR",   vendors: ["XSOAR", "Splunk SOAR", "Tines", "Torq"], desc: "Trigger SOAR playbooks from Sentry containment steps; mirror status into the Sentry incident timeline.", eta: "Q4 2026" },
  { n: "GRC",         i: "📋", category: "GRC",         vendors: ["ServiceNow GRC", "Drata", "Vanta", "SCF Connect"], desc: "Push CSF assessment results and policy-coverage data into your GRC platform; pull control evidence in the other direction.", eta: "Q4 2026" },
  { n: "Ticketing",   i: "🎫", category: "Ticketing",   vendors: ["ServiceNow", "Jira", "Linear"], desc: "Two-way ticket sync. Sentry remains the IR source-of-truth; engineering work lives where engineers already work.", eta: "Q3 2026" },
  { n: "Threat Intel", i: "🔍", category: "Threat Intel", vendors: ["MISP", "Recorded Future", "VirusTotal"], desc: "Enrich IOCs during active incidents and pull adversary context into the threat intel feed.", eta: "2027" },
  { n: "Productivity", i: "💬", category: "Productivity", vendors: ["Slack", "Teams", "PagerDuty"], desc: "Channel-of-record per incident, automatic war-room creation, on-call paging tied to severity.", eta: "Q4 2026" },
];

const CATEGORY_COLOR: Record<RoadmapItem["category"], string> = {
  "SIEM/SOAR": "#3B82F6",
  "Endpoint": "#EF4444",
  "Identity": "#8B5CF6",
  "GRC": "#22C55E",
  "Ticketing": "#F97316",
  "Threat Intel": "#06B6D4",
  "Productivity": "#EAB308",
};

export function IntegrationsModule() {
  const modal = useModal();
  const colors = useColors();
  const { org } = useStore();
  const [interest, setInterest] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const registerInterest = async (item: RoadmapItem) => {
    setBusy(item.n);
    const subject = `[Sentry Roadmap] ${org?.name ?? "Tenant"} → ${item.n} integration`;
    const body =
`<p>Tenant <strong>${org?.name ?? "(unknown)"}</strong> registered interest in the <strong>${item.n}</strong> integration.</p>
<p><strong>Category:</strong> ${item.category}<br/>
<strong>Vendors of interest:</strong> ${item.vendors.join(", ")}<br/>
<strong>Current ETA:</strong> ${item.eta}</p>
<p>This was triggered from the Sentry Integrations module.</p>`;

    const res = await sendNotificationEmail({
      to: ["product@darkrocksecurity.com"],
      subject,
      body,
      classification: "INTERNAL",
    });
    setBusy(null);
    if (res.ok) {
      setInterest((p) => ({ ...p, [item.n]: true }));
      await modal.showAlert("Interest registered", `Our product team has been notified. We'll reach out as ${item.n} approaches release.`);
    } else {
      await modal.showAlert("Couldn't register interest", res.error ?? "Email delivery failed. Please try again later.");
    }
  };

  return (
    <div>
      <SectionHeader sub="Roadmap of upstream system integrations — register interest to be notified at GA">Integrations Roadmap</SectionHeader>
      <Card style={{ marginBottom: 16, borderLeft: `3px solid ${colors.teal}`, padding: 14 }}>
        <p style={{ color: colors.textMuted, fontSize: 11, margin: 0, lineHeight: 1.6 }}>
          Sentry runs natively without integrations. These connectors are on the roadmap to remove copy/paste between Sentry and the rest of your security stack. Click <em>Register Interest</em> to add your tenant to the early-access list for any of them — our product team is notified directly.
        </p>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {ROADMAP.map((x) => (
          <Card key={x.n} style={{ borderLeft: `3px solid ${CATEGORY_COLOR[x.category]}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{x.i}</span>
              <span style={{ color: colors.white, fontWeight: 700, fontSize: 13 }}>{x.n}</span>
              <Badge color={CATEGORY_COLOR[x.category]}>{x.category}</Badge>
            </div>
            <p style={{ color: colors.textMuted, fontSize: 11, margin: "0 0 10px", lineHeight: 1.5 }}>{x.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
              {x.vendors.map((v) => <Badge key={v} color={colors.textDim}>{v}</Badge>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: colors.textDim, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em" }}>TARGET</span>
              <span style={{ color: colors.teal, fontSize: 11, fontWeight: 700 }}>{x.eta}</span>
            </div>
            <Button
              variant={interest[x.n] ? "secondary" : "outline"}
              size="sm"
              style={{ width: "100%" }}
              disabled={busy === x.n || interest[x.n]}
              onClick={() => registerInterest(x)}
            >
              {busy === x.n ? "Sending…" : interest[x.n] ? "✓ Interest Registered" : "Register Interest"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
