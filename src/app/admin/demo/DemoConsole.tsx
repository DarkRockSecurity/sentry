"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createDemoSession, deleteDemoSession, resetDemoTenant, inviteToTemplate } from "@/app/admin/_actions";

const colors = {
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelLight: "#151C28",
  panelBorder: "#1E293B",
  red: "#EF4444",
  green: "#22C55E",
  orange: "#F97316",
  purple: "#8B5CF6",
};

type DemoTenant = {
  id: string;
  name: string;
  slug: string;
  notes: string | null;
  createdAt: string;
  stateUpdatedAt: string | null;
  stateVersion: number | null;
  users: { id: string; email: string; fullName: string | null; role: string; active: boolean; invitedAt: string; lastSeenAt: string | null }[];
};

type CreatedSession = { tenantId: string; email: string; magicLink?: string; password?: string; emailSent?: boolean };

export function DemoConsole({ template, sessions }: { template: DemoTenant | null; sessions: DemoTenant[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ color: colors.tealLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "Figtree, sans-serif" }}>DEMO ENVIRONMENT</div>
          <h1 style={{ color: colors.text, fontSize: 26, fontWeight: 800, margin: "6px 0 0", fontFamily: "Figtree, sans-serif", letterSpacing: "-0.01em" }}>
            Sandbox &amp; isolated sessions
          </h1>
          <p style={{ color: colors.textMuted, fontSize: 14, margin: "6px 0 0", lineHeight: 1.55, maxWidth: 740 }}>
            Each prospect gets their own <strong style={{ color: colors.text }}>isolated demo tenant</strong> cloned from the
            template below. Their edits never touch other prospects&rsquo; data, and you can end a session anytime with one click.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
            color: "#0A0E14",
            fontWeight: 700,
            fontSize: 14,
            border: 0,
            cursor: "pointer",
            fontFamily: "Figtree, sans-serif",
            boxShadow: "0 4px 16px rgba(0,180,166,0.22)",
          }}
        >
          + New demo session
        </button>
      </header>

      {creating && <CreateSessionDialog onClose={() => setCreating(false)} />}

      <h2 style={sectionHeader}>Active sessions ({sessions.length})</h2>
      {sessions.length === 0 ? (
        <div style={emptyCard}>
          No isolated demo sessions yet. Click <strong style={{ color: colors.tealLight }}>+ New demo session</strong> to spin one up.
        </div>
      ) : (
        sessions.map((s) => <SessionRow key={s.id} session={s} />)
      )}

      <h2 style={{ ...sectionHeader, marginTop: 36 }}>Demo template</h2>
      <p style={{ color: colors.textMuted, fontSize: 12, margin: "0 0 12px", lineHeight: 1.5 }}>
        The canonical seed source. Every new session clones from this template&rsquo;s state. Reset to refresh the seed.
      </p>
      {template ? <TemplateCard template={template} /> : (
        <div style={emptyCard}>No master template found. Run <code style={{ color: colors.tealLight }}>prisma/bootstrap.sql</code> to create it.</div>
      )}
    </>
  );
}

// ── New session dialog ─────────────────────────────────────────────

function generatePassword() {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 14; i++) pw += charset[Math.floor(Math.random() * charset.length)];
  return pw;
}

function CreateSessionDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [method, setMethod] = useState<"email" | "magiclink" | "password">("email");
  const [password, setPassword] = useState(generatePassword);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedSession | null>(null);

  function submit() {
    setError(null);
    setCreated(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("fullName", fullName);
    fd.set("company", company);
    fd.set("method", method);
    if (method === "password") fd.set("password", password);
    startTransition(async () => {
      const r = await createDemoSession(fd);
      if (!r.ok) {
        setError(r.error || "Failed");
      } else {
        setCreated({ tenantId: r.tenantId!, email: r.email!, magicLink: r.magicLink, password: r.password, emailSent: r.emailSent });
      }
    });
  }

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={dialog}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ color: colors.tealLight, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em" }}>ISOLATED DEMO SESSION</div>
            <h2 style={{ color: colors.text, fontSize: 18, fontWeight: 800, margin: "6px 0 0", fontFamily: "Figtree, sans-serif" }}>Spin up a new demo</h2>
            <p style={{ color: colors.textMuted, fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
              Clones the template into a fresh tenant just for this prospect. Their edits stay isolated.
            </p>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {created ? (
          <CreatedPanel session={created} onClose={onClose} />
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Prospect email *">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="prospect@example.com" style={input} />
              </Field>
              <Field label="Prospect name">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Prospect" style={input} />
              </Field>
              <Field label="Company (optional)" hint="Personalizes the session label.">
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Health" style={input} />
              </Field>
              <Field label="Auth method *">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <RadioBtn label="Email invite" sub="Sends sign-in link automatically" active={method === "email"} onClick={() => setMethod("email")} />
                  <RadioBtn label="Magic link" sub="Copy/share manually" active={method === "magiclink"} onClick={() => setMethod("magiclink")} />
                  <RadioBtn label="Password" sub="If email may bounce" active={method === "password"} onClick={() => setMethod("password")} />
                </div>
              </Field>
            </div>

            {method === "password" && (
              <Field label="Initial password *" hint="Auto-generated; share with the prospect.">
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" style={{ ...input, fontFamily: "JetBrains Mono, monospace", fontSize: 12, flex: 1 }} />
                  <button type="button" onClick={() => setPassword(generatePassword())} style={miniBtn}>↻</button>
                </div>
              </Field>
            )}

            {method === "email" && (
              <div style={{ marginTop: 12, padding: 12, background: colors.panelLight, borderRadius: 8, color: colors.textMuted, fontSize: 11, lineHeight: 1.5 }}>
                Supabase will send the invite email automatically. If you haven&rsquo;t configured custom SMTP yet, the
                default Supabase sender works for testing (rate-limited to 4 emails/hour).
              </div>
            )}

            {error && <div style={{ color: colors.red, fontSize: 12, marginTop: 12 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
              <button onClick={onClose} style={btnSecondary}>Cancel</button>
              <button onClick={submit} disabled={pending || !email} style={btnPrimary}>
                {pending ? "Provisioning…" : "Create session →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CreatedPanel({ session, onClose }: { session: CreatedSession; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = session.magicLink || `${typeof window !== "undefined" ? window.location.origin : ""}/login`;

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Pure email-sent state: no link to surface
  if (session.emailSent && !session.magicLink && !session.password) {
    return (
      <div>
        <div style={{ padding: 16, background: colors.green + "10", border: `1px solid ${colors.green}55`, borderRadius: 10, marginBottom: 14 }}>
          <div style={{ color: colors.green, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>✓ Invitation emailed</div>
          <div style={{ color: colors.text, fontSize: 13, lineHeight: 1.55 }}>
            <strong style={{ color: colors.green }}>{session.email}</strong> will receive a sign-in link from your Supabase project&rsquo;s
            configured sender. They click it once and land in their isolated demo tenant.
          </div>
        </div>
        <div style={{ background: "#080C12", border: `1px solid ${colors.panelBorder}`, borderRadius: 10, padding: 14, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
          <KV label="tenant" value={session.tenantId} mono />
        </div>
        <div style={{ color: colors.textDim, fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
          Email not arriving? Check Supabase &rarr; Authentication &rarr; Email Templates and SMTP settings. The default Supabase
          sender is rate-limited to 4/hour; configure custom SMTP in your Supabase project for production volume.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: 14, background: colors.green + "10", border: `1px solid ${colors.green}55`, borderRadius: 10, marginBottom: 14 }}>
        <div style={{ color: colors.green, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>✓ Demo session created</div>
        <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.5 }}>
          A fresh isolated tenant has been provisioned for <strong style={{ color: colors.text }}>{session.email}</strong>. Hand them the access details below.
        </div>
      </div>

      <div style={{ background: "#080C12", border: `1px solid ${colors.panelBorder}`, borderRadius: 10, padding: 14, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
        <KV label="email" value={session.email} onCopy={copy} />
        {session.magicLink && (
          <KV label="magic link" value={session.magicLink} onCopy={copy} ml />
        )}
        {session.password && (
          <>
            <KV label="password" value={session.password} onCopy={copy} />
            <KV label="sign-in url" value={url} onCopy={copy} />
          </>
        )}
        <KV label="tenant" value={session.tenantId} mono />
      </div>

      {session.magicLink && (
        <div style={{ color: colors.textDim, fontSize: 11, marginTop: 10, lineHeight: 1.5 }}>
          The magic link is single-use and expires in ~24 hours. If they need a fresh one later, end the session and create a new one.
        </div>
      )}

      {copied && <div style={{ color: colors.green, fontSize: 11, marginTop: 8 }}>✓ Copied to clipboard</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button onClick={onClose} style={btnPrimary}>Done</button>
      </div>
    </div>
  );
}

// ── Session row ────────────────────────────────────────────────────

function SessionRow({ session }: { session: DemoTenant }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const owner = session.users[0];

  function endSession() {
    if (!confirm(`End demo for ${owner?.email ?? session.name}? This deletes the tenant and all data.`)) return;
    startTransition(async () => {
      const r = await deleteDemoSession(session.id);
      if (!r.ok) setError(r.error || "Failed");
    });
  }

  const ageDays = Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 86400000);

  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderLeft: `3px solid ${colors.orange}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: colors.text, fontSize: 14, fontWeight: 700, fontFamily: "Figtree, sans-serif" }}>{session.name}</span>
          <Tag color={colors.orange}>DEMO</Tag>
          {ageDays > 14 && <Tag color={colors.red}>{ageDays}d old</Tag>}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
          {owner ? <><strong style={{ color: colors.text }}>{owner.email}</strong> · invited {new Date(owner.invitedAt).toLocaleDateString()}</> : <em style={{ color: colors.textDim }}>no users</em>}
          {" · "}<span style={{ color: colors.textDim, fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{session.id}</span>
        </div>
        {error && <div style={{ color: colors.red, fontSize: 11, marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Link href={`/admin/tenants/${session.id}`} style={btnGhost}>Inspect →</Link>
        <button onClick={endSession} disabled={pending} style={btnDanger}>{pending ? "…" : "End session"}</button>
      </div>
    </div>
  );
}

// ── Template card ──────────────────────────────────────────────────

function TemplateCard({ template }: { template: DemoTenant }) {
  const [pending, startTransition] = useTransition();
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  function reset() {
    if (!confirm("Re-seed the master template? Existing sessions are NOT affected (they cloned a snapshot).")) return;
    setResetMessage(null);
    startTransition(async () => {
      const r = await resetDemoTenant(template.id);
      setResetMessage(r.ok ? "✓ Template reseeded — future sessions will use this snapshot." : `✕ ${r.error}`);
    });
  }

  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderTop: `2px solid ${colors.tealLight}`, borderRadius: 12, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ color: colors.text, fontSize: 14, fontWeight: 700, fontFamily: "Figtree, sans-serif" }}>{template.name}</div>
          <div style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
            <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{template.id}</span> · slug <code style={{ color: colors.text }}>{template.slug}</code>
          </div>
          <div style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>
            {template.stateUpdatedAt
              ? <>Last seeded: <strong style={{ color: colors.text }}>{new Date(template.stateUpdatedAt).toLocaleString()}</strong> (v{template.stateVersion})</>
              : <>Not yet seeded — click <strong style={{ color: colors.tealLight }}>Reseed template</strong>.</>
            }
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={reset} disabled={pending} style={btnGhost}>↻ Reseed template</button>
          <button onClick={() => setShowInvite(!showInvite)} style={btnGhost}>{showInvite ? "Cancel" : "+ Self-preview"}</button>
        </div>
      </div>
      {resetMessage && (
        <div style={{ marginTop: 10, color: resetMessage.startsWith("✓") ? colors.green : colors.red, fontSize: 12 }}>{resetMessage}</div>
      )}
      {showInvite && <InvitePreviewToTemplate onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function InvitePreviewToTemplate({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState<{ magicLink?: string; password?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("fullName", fullName);
    fd.set("method", "magiclink");
    startTransition(async () => {
      const r = await inviteToTemplate(fd);
      if (!r.ok) setError(r.error || "Failed");
      else setCreated({ magicLink: r.magicLink, password: r.password });
    });
  }

  return (
    <div style={{ marginTop: 14, padding: 14, background: colors.panelLight, border: `1px solid ${colors.panelBorder}`, borderRadius: 8 }}>
      <div style={{ color: colors.text, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Generate a self-preview link</div>
      <div style={{ color: colors.textMuted, fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
        Use this for an internal preview of the template. For real prospects, create an isolated session instead.
      </div>
      {!created ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@darkrock.example" type="email" style={input} />
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" style={input} />
          </div>
          {error && <div style={{ color: colors.red, fontSize: 11, marginTop: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button onClick={submit} disabled={pending || !email} style={btnPrimary}>{pending ? "…" : "Generate link"}</button>
            <button onClick={onClose} style={btnSecondary}>Cancel</button>
          </div>
        </>
      ) : (
        <div style={{ background: "#080C12", padding: 10, borderRadius: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 11, wordBreak: "break-all", color: colors.text }}>
          {created.magicLink ?? created.password}
        </div>
      )}
    </div>
  );
}

// ── Atoms ──────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ color: colors.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 6, fontFamily: "Figtree, sans-serif" }}>{label}</div>
      {children}
      {hint && <div style={{ color: colors.textDim, fontSize: 10, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

function RadioBtn({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 8,
        background: active ? colors.teal + "1A" : "#0A0E14",
        border: `1px solid ${active ? colors.teal + "55" : colors.panelBorder}`,
        color: active ? colors.teal : colors.text,
        fontFamily: "Figtree, sans-serif",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{sub}</div>
    </button>
  );
}

function KV({ label, value, onCopy, mono, ml }: { label: string; value: string; onCopy?: (s: string) => void; mono?: boolean; ml?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0" }}>
      <span style={{ color: colors.textMuted, minWidth: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ color: mono ? colors.textMuted : colors.text, flex: 1, wordBreak: "break-all", fontFamily: ml ? "JetBrains Mono, monospace" : undefined, fontSize: ml ? 10 : 12 }}>{value}</span>
      {onCopy && (
        <button onClick={() => onCopy(value)} style={miniBtn}>copy</button>
      )}
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700, color, background: color + "1A", border: `1px solid ${color}33`, letterSpacing: "0.06em" }}>
      {children}
    </span>
  );
}

const sectionHeader: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  margin: "0 0 12px",
  fontFamily: "Figtree, sans-serif",
};

const emptyCard: React.CSSProperties = {
  background: colors.panel,
  border: `1px solid ${colors.panelBorder}`,
  borderRadius: 10,
  padding: 22,
  color: colors.textDim,
  fontSize: 13,
  textAlign: "center",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(8, 12, 18, 0.86)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  zIndex: 100,
};

const dialog: React.CSSProperties = {
  width: "100%",
  maxWidth: 620,
  background: colors.panel,
  border: `1px solid ${colors.panelBorder}`,
  borderRadius: 14,
  padding: 22,
  fontFamily: "Source Sans 3, sans-serif",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
};

const closeBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 7,
  background: "transparent",
  border: `1px solid ${colors.panelBorder}`,
  color: colors.textMuted,
  cursor: "pointer",
  fontFamily: "Figtree, sans-serif",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  background: "#0A0E14",
  border: `1px solid ${colors.panelBorder}`,
  color: colors.text,
  fontSize: 13,
  fontFamily: "Source Sans 3, sans-serif",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  background: colors.teal,
  color: "#0A0E14",
  fontWeight: 700,
  fontSize: 12,
  border: 0,
  cursor: "pointer",
  fontFamily: "Figtree, sans-serif",
};
const btnSecondary: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 8,
  background: colors.panelLight,
  color: colors.text,
  fontWeight: 600,
  fontSize: 12,
  border: `1px solid ${colors.panelBorder}`,
  cursor: "pointer",
  fontFamily: "Figtree, sans-serif",
};
const btnGhost: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: colors.panelLight,
  color: colors.text,
  fontWeight: 600,
  fontSize: 12,
  border: `1px solid ${colors.panelBorder}`,
  cursor: "pointer",
  fontFamily: "Figtree, sans-serif",
  textDecoration: "none",
};
const btnDanger: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "transparent",
  color: colors.red,
  fontWeight: 600,
  fontSize: 12,
  border: `1px solid ${colors.red}55`,
  cursor: "pointer",
  fontFamily: "Figtree, sans-serif",
};
const miniBtn: React.CSSProperties = {
  padding: "0 10px",
  borderRadius: 6,
  background: colors.panelLight,
  border: `1px solid ${colors.panelBorder}`,
  color: colors.textMuted,
  fontSize: 10,
  cursor: "pointer",
};
