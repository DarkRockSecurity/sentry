// ─────────────────────────────────────────────────────────────────────
// Assessment Hitlist Engine
//
// Given a saved NIST CSF 2.0 assessment + the org's tech stack, produce
// three buckets of recommendations: Short-term (0-30 days), Achievable
// (1-3 months), and Aspirational (3-12 months). Each recommendation
// carries advice, the "why" (impact), concrete next steps, an automation
// flag, and an estimated score uplift.
//
// Bucket rules:
//   • shortTerm   = priority ≥ 6 AND (automatable OR effortDays ≤ 14)
//   • achievable  = priority ≥ 4 AND effortDays ≤ 90
//   • aspirational= remaining low-scoring controls (transformational)
//
// Priority = question weight × (3 - currentScore). A question scored 0
// with weight 3 has priority 9. A question scored 2 with weight 2 has
// priority 2.
// ─────────────────────────────────────────────────────────────────────

import type { Assessment } from "@/types/assessment";
import type { TechStack } from "@/types/organization";
import { CSF2 } from "@/data/csf2-controls";

export type HitlistBucket = "shortTerm" | "achievable" | "aspirational";

export interface HitlistItem {
  questionId: string;
  csfFunction: string;     // e.g. "PROTECT"
  csfCategory: string;     // e.g. "Identity Management, Authentication & Access"
  control: string;         // The CSF question text itself
  currentScore: number;    // 0–4 maturity
  weight: number;          // CSF weight 2 or 3
  priority: number;        // weight × (3 - currentScore)
  bucket: HitlistBucket;
  title: string;
  why: string;             // why it matters (impact)
  advice: string;          // what to do
  steps: string[];         // concrete next steps
  effortDays: number;      // estimated effort in calendar days
  scoreLift: number;       // estimated uplift of overall resilience score (points)
  automatable: boolean;    // org's stack supports automating this
  automationDriver?: string; // which tech (Identity/EDR/SIEM/etc) drives the automation
}

export interface Hitlist {
  shortTerm: HitlistItem[];
  achievable: HitlistItem[];
  aspirational: HitlistItem[];
  totals: {
    items: number;
    automatable: number;
    estimatedTotalLift: number;
  };
  generatedAt: string;
}

// ─── Curated recommendation library ──────────────────────────────────
// Keyed by CSF question id. Each entry produces a recommendation when
// that question scores < 3. Questions not in this library fall back to
// the generic builder below.

interface RecTemplate {
  title: string;
  why: string;
  advice: string;
  steps: string[];
  effortDays: number;
  scoreLift: number;
  /** Tech-stack key that, if configured, makes this automatable. */
  smart?: keyof TechStack;
  /** Force into a bucket (override priority math). Used for transformational items. */
  forceBucket?: HitlistBucket;
}

const LIBRARY: Record<string, RecTemplate> = {
  // ─ Identity & Access ─────────────────────────────────────────────
  "PR.AA-01": {
    title: "Centralize identity lifecycle in your IdP",
    why: "Decentralized identities lead to orphaned accounts, shared credentials, and slow off-boarding — the most common ransomware entry vector.",
    advice: "Designate a single identity provider as the source of truth for workforce identity. Eliminate local accounts on critical systems and federate through the IdP.",
    steps: [
      "Inventory every system that holds local user accounts (servers, SaaS, network devices).",
      "Federate the top 10 highest-risk systems to your IdP via SAML/OIDC.",
      "Disable local accounts on federated systems; remove shared credentials.",
      "Schedule quarterly orphaned-account reviews driven by HR-IdP joiner/mover/leaver feed.",
    ],
    effortDays: 45,
    scoreLift: 6,
    smart: "identity",
  },
  "PR.AA-03": {
    title: "Enforce phishing-resistant MFA everywhere",
    why: "MFA prevents the vast majority of credential-theft incidents. SMS/voice MFA is bypassable; FIDO2/passkeys are not.",
    advice: "Roll out phishing-resistant MFA (FIDO2 keys, platform passkeys, or app-based push with number matching) for every user, then block legacy SMS-only MFA.",
    steps: [
      "Audit current MFA coverage: which apps require it, which factor types are accepted.",
      "Issue YubiKeys or enable passkeys for every employee and contractor.",
      "Set conditional access policies: require MFA for any sign-in to email, admin consoles, VPN, and cloud platforms.",
      "Disable SMS and voice MFA factors after a 30-day grace period.",
    ],
    effortDays: 21,
    scoreLift: 9,
    smart: "mfa",
  },
  "PR.AA-05": {
    title: "Enforce least privilege with just-in-time elevation",
    why: "Standing admin privileges are an attacker's force multiplier. JIT elevation reduces the attack window from forever to minutes.",
    advice: "Move privileged access to a JIT model — admin rights are requested, time-bound, and logged. Use PAM tooling for credential vaulting and session recording.",
    steps: [
      "Identify all standing admin roles (Domain Admin, AWS root, GCP owner, etc.).",
      "Implement JIT elevation via your IdP or PAM (e.g. CyberArk, BeyondTrust, Entra PIM).",
      "Set max elevation duration to 4 hours; require approval for production changes.",
      "Enable session recording on critical resources.",
    ],
    effortDays: 60,
    scoreLift: 7,
    smart: "identity",
  },
  // ─ Data Security ─────────────────────────────────────────────────
  "PR.DS-01": {
    title: "Enable encryption-at-rest with customer-managed keys",
    why: "Default cloud encryption protects against physical theft but not against compromised cloud admin credentials. Customer-managed keys put control back with you.",
    advice: "Enable encryption-at-rest with customer-managed keys (CMK) on every data store: object storage, databases, backups, and disk volumes.",
    steps: [
      "Enable CMK on storage buckets, RDS/Cloud SQL, and managed disks.",
      "Rotate keys annually and audit key access via KMS logs.",
      "Document the key recovery process for IR scenarios.",
    ],
    effortDays: 14,
    scoreLift: 5,
    smart: "cloud",
  },
  "PR.DS-02": {
    title: "Enforce TLS 1.2+ everywhere; block legacy protocols",
    why: "Plaintext traffic and legacy TLS versions are routinely exploited for MITM and credential theft.",
    advice: "Inventory every internal and external endpoint; require TLS 1.2+ with strong cipher suites. Block plain HTTP, SMB v1, and SSL/TLS < 1.2.",
    steps: [
      "Run a network-wide TLS audit (e.g. nmap, internal scanners).",
      "Deploy TLS 1.2 minimum on load balancers and reverse proxies.",
      "Disable SMBv1, NTLMv1, and legacy ciphers domain-wide.",
    ],
    effortDays: 21,
    scoreLift: 4,
  },
  // ─ Platform Security ─────────────────────────────────────────────
  "PR.PS-02": {
    title: "Reduce time-to-patch on internet-facing assets to <14 days",
    why: "Most exploited CVEs were patched 30+ days before exploitation. Closing your patch window slams the door on opportunistic attackers.",
    advice: "Establish a patch SLA tied to severity: critical/exploited vulns patched within 7 days, high within 14, medium within 30. Automate patch deployment via your endpoint or config-management tool.",
    steps: [
      "Deploy patch management tooling (Intune, Tanium, Automox, Ivanti).",
      "Define patch SLAs in policy and surface them on the dashboard.",
      "Wire vuln scanner output to ticket auto-creation.",
      "Track patch compliance week-over-week.",
    ],
    effortDays: 30,
    scoreLift: 7,
    smart: "endpoint",
  },
  "PR.PS-04": {
    title: "Centralize logs in a SIEM with 90-day hot retention",
    why: "Without centralized logs, every investigation starts cold. A 90-day hot retention covers the typical dwell time of mid-sophistication adversaries.",
    advice: "Stand up (or expand) a SIEM with logs from identity, endpoint, network, email, and cloud sources. Retain 90 days hot for query, 1 year warm for compliance.",
    steps: [
      "Choose SIEM (Sentinel, Splunk, Elastic, Sumo).",
      "Onboard high-value log sources first: IdP, EDR, firewall, M365 unified audit log.",
      "Build correlation rules for the top 5 attack patterns relevant to your industry.",
      "Test detection coverage against MITRE ATT&CK with Atomic Red Team.",
    ],
    effortDays: 75,
    scoreLift: 9,
    smart: "siem",
  },
  "PR.PS-05": {
    title: "Implement application allow-listing on critical endpoints",
    why: "Allow-listing flips the security model: instead of trying to block every malicious binary, you only allow known-good. Stops nearly all custom malware.",
    advice: "Pilot WDAC, AppLocker, or a third-party allow-list tool on Tier-0 systems (DCs, jump boxes, finance workstations). Expand from there.",
    steps: [
      "Deploy in audit mode for 30 days to baseline.",
      "Build allow-list rules from baseline; whitelist signed publishers.",
      "Switch to enforcement on Tier-0 systems first.",
    ],
    effortDays: 90,
    scoreLift: 5,
    forceBucket: "aspirational",
  },
  // ─ Resilience ────────────────────────────────────────────────────
  "PR.IR-01": {
    title: "Segment the network and implement zero-trust egress",
    why: "Flat networks let one compromised endpoint reach everything. Segmentation contains blast radius; zero-trust egress kills C2.",
    advice: "Move from VLAN-based to identity-based segmentation. Force egress through a SWG that filters by identity, not just IP.",
    steps: [
      "Map current east-west traffic with NDR or sFlow.",
      "Enforce micro-segmentation between user, server, and OT zones.",
      "Route all egress through a secure web gateway with TLS inspection.",
    ],
    effortDays: 120,
    scoreLift: 8,
    smart: "firewall",
    forceBucket: "aspirational",
  },
  "PR.IR-03": {
    title: "Implement immutable backups with quarterly restore tests",
    why: "Ransomware actors target backups first. Immutable backups + tested restore is the only reliable path to recovery without paying.",
    advice: "Use a backup tool that supports immutability (object-lock, write-once snapshots). Schedule quarterly full-system restore drills.",
    steps: [
      "Enable immutability/object-lock on backup repositories.",
      "Verify the 3-2-1-1 rule: 3 copies, 2 media, 1 off-site, 1 immutable.",
      "Schedule a quarterly tabletop with an actual restore (not just a paper exercise).",
    ],
    effortDays: 30,
    scoreLift: 9,
    smart: "backup",
  },
  // ─ Detection ─────────────────────────────────────────────────────
  "DE.CM-01": {
    title: "Tune SIEM detections to your top 5 industry threats",
    why: "Default SIEM rules generate noise. Tuned detections aligned to your industry's threat profile catch the actors who are actually after you.",
    advice: "Pull your industry's top threat actors and TTPs (CISA advisories, ISAC reports). Build or import detection-as-code rules tied to those TTPs.",
    steps: [
      "Subscribe to your sector's ISAC.",
      "Import community detection rules (Sigma, Elastic SIEM rules).",
      "Run purple-team exercises monthly to verify coverage.",
    ],
    effortDays: 45,
    scoreLift: 6,
    smart: "siem",
  },
  "DE.CM-09": {
    title: "Deploy EDR with auto-isolation policies",
    why: "EDR without auto-isolation is a slow human-in-the-loop. With auto-isolation, ransomware staging is interrupted in seconds, not hours.",
    advice: "Configure your EDR to automatically isolate hosts that trigger high-confidence detections (ransomware behavior, credential dumping, defense evasion).",
    steps: [
      "Audit current EDR coverage (must be 95%+ of endpoints).",
      "Enable auto-isolation policies with a notification + analyst-review SLA.",
      "Document isolation procedures so on-call can rapidly release legitimate hosts.",
    ],
    effortDays: 21,
    scoreLift: 7,
    smart: "endpoint",
  },
  "DE.AE-03": {
    title: "Correlate events across identity, endpoint, and network",
    why: "Single-source detections miss multi-stage attacks. Cross-correlation catches the lateral movement that looks normal in any one log source.",
    advice: "Build SIEM rules (or an XDR pipeline) that correlate events across identity, endpoint, and network within a 24h window.",
    steps: [
      "Define 5 correlated detections (e.g. impossible-travel + EDR alert; new IdP app consent + outbound C2).",
      "Tune false-positive rate below 1% per detection.",
      "Re-evaluate quarterly as the environment changes.",
    ],
    effortDays: 60,
    scoreLift: 7,
    smart: "siem",
  },
  // ─ Recovery ──────────────────────────────────────────────────────
  "RC.RP-01": {
    title: "Document a tested IR Recovery Plan with RTO/RPO per asset",
    why: "Recovery decisions made under stress without a plan cost money and reputation. A tested plan with quantified RTO/RPO turns an hour-by-hour panic into a checklist.",
    advice: "Author an IR Recovery Plan that names RTO/RPO per critical asset, recovery owner, and decision points. Test it annually with a tabletop exercise.",
    steps: [
      "Identify your top 10 critical business systems.",
      "Set RTO and RPO targets per system; verify backup cadence supports them.",
      "Run a tabletop exercise simulating ransomware recovery.",
      "Update the plan with lessons learned.",
    ],
    effortDays: 30,
    scoreLift: 6,
  },
  "RC.RP-03": {
    title: "Verify backup integrity automatically before each restore",
    why: "Ransomware groups now poison backups months before triggering. Automated integrity checks catch silent corruption before it ruins recovery.",
    advice: "Add automated integrity verification (cryptographic hashes, periodic test restores into isolated sandboxes) so you never restore tampered data.",
    steps: [
      "Configure backup tooling to compute & verify SHA-256 of backup blocks.",
      "Schedule monthly test-restores of random samples into an isolated sandbox.",
      "Alert on any unexpected backup growth, frequent file overwrites, or short retention.",
    ],
    effortDays: 14,
    scoreLift: 5,
    smart: "backup",
  },
};

// ─── Hitlist generator ───────────────────────────────────────────────

const FN_LABEL: Record<string, string> = {
  GV: "GOVERN",
  ID: "IDENTIFY",
  PR: "PROTECT",
  DE: "DETECT",
  RS: "RESPOND",
  RC: "RECOVER",
};

export function generateHitlist(assessment: Assessment, tech: TechStack): Hitlist {
  const allQs = CSF2.flatMap((fn) =>
    fn.cats.flatMap((cat) =>
      cat.qs.map((q) => ({ q, fn: fn.fn, fnId: fn.id, cat: cat.n }))
    )
  );

  const items: HitlistItem[] = [];

  for (const { q, fn, fnId, cat } of allQs) {
    const score = assessment.answers[q.id] ?? 0;
    if (score >= 3) continue; // skip well-implemented

    const tpl = LIBRARY[q.id] ?? buildGenericTemplate(q, fn);
    const smartKey = (tpl.smart ?? q.smart) as keyof TechStack | undefined;
    const stackValue = smartKey ? tech?.[smartKey] : undefined;
    const automatable = Boolean(smartKey && stackValue && stackValue !== "" && stackValue !== "None" && stackValue !== "Not Implemented");

    const priority = q.w * (3 - score);
    let bucket: HitlistBucket;
    if (tpl.forceBucket) {
      bucket = tpl.forceBucket;
    } else if (priority >= 6 && (automatable || tpl.effortDays <= 14)) {
      bucket = "shortTerm";
    } else if (priority >= 4 && tpl.effortDays <= 90) {
      bucket = "achievable";
    } else {
      bucket = "aspirational";
    }

    items.push({
      questionId: q.id,
      csfFunction: FN_LABEL[fnId] ?? fn,
      csfCategory: cat,
      control: q.q,
      currentScore: score,
      weight: q.w,
      priority,
      bucket,
      title: tpl.title,
      why: tpl.why,
      advice: tpl.advice,
      steps: tpl.steps,
      effortDays: tpl.effortDays,
      scoreLift: tpl.scoreLift,
      automatable,
      automationDriver: automatable ? humanStackKey(smartKey, stackValue) : undefined,
    });
  }

  // Sort each bucket by priority desc, then by scoreLift desc, then cap.
  const cmp = (a: HitlistItem, b: HitlistItem) =>
    b.priority - a.priority || b.scoreLift - a.scoreLift;

  const shortTerm = items.filter((i) => i.bucket === "shortTerm").sort(cmp).slice(0, 8);
  const achievable = items.filter((i) => i.bucket === "achievable").sort(cmp).slice(0, 8);
  const aspirational = items.filter((i) => i.bucket === "aspirational").sort(cmp).slice(0, 6);

  const totalSelected = [...shortTerm, ...achievable, ...aspirational];
  return {
    shortTerm,
    achievable,
    aspirational,
    totals: {
      items: totalSelected.length,
      automatable: totalSelected.filter((i) => i.automatable).length,
      estimatedTotalLift: totalSelected.reduce((s, i) => s + i.scoreLift, 0),
    },
    generatedAt: new Date().toISOString(),
  };
}

function buildGenericTemplate(q: { id: string; q: string; w: number; smart?: string }, fn: string): RecTemplate {
  return {
    title: `Improve maturity on ${q.id}`,
    why: `This control falls under ${fn}. Maturing it strengthens your overall resilience and addresses NIST CSF 2.0 expectations.`,
    advice: q.q,
    steps: [
      `Document current implementation against ${q.id}.`,
      "Identify the smallest implementation gap that lifts maturity to 'Defined'.",
      "Assign an owner and a 30-day target date.",
      "Re-assess after the change is live.",
    ],
    effortDays: q.w >= 3 ? 45 : 30,
    scoreLift: q.w * 2,
    smart: q.smart as keyof TechStack | undefined,
  };
}

function humanStackKey(key: keyof TechStack | undefined, value: unknown): string | undefined {
  if (!key) return undefined;
  const labels: Partial<Record<keyof TechStack, string>> = {
    identity: "Identity Provider",
    endpoint: "EDR",
    siem: "SIEM",
    firewall: "Firewall",
    cloud: "Cloud Provider",
    backup: "Backup Platform",
    mfa: "MFA Tool",
    email: "Email Security",
    vulnerability: "Vulnerability Mgmt",
    dlp: "DLP",
  };
  const lbl = labels[key] ?? String(key);
  return value ? `${lbl}: ${value}` : lbl;
}
