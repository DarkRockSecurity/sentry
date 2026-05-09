"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { RookLogo } from "@/components/marketing/RookLogo";

const colors = {
  obsidian: "#0A0E14",
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  teal: "#00B4A6",
  tealLight: "#33C4B8",
  panel: "#0F1623",
  panelBorder: "#1E293B",
  red: "#F87171",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params?.get("redirectTo") || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);
    if (signInError) {
      setError(signInError.message || "Sign-in failed.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.obsidian,
        color: colors.text,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(0,180,166,0.16) 0%, rgba(0,180,166,0) 60%), radial-gradient(40% 30% at 50% 100%, rgba(0,180,166,0.08) 0%, rgba(0,180,166,0) 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          position: "relative",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <RookLogo size={36} />
          <div>
            <div style={{ color: colors.text, fontWeight: 700, fontSize: 16, fontFamily: "Figtree, sans-serif" }}>
              Sentry
            </div>
            <div style={{ color: colors.teal, fontSize: 9, fontWeight: 700, letterSpacing: "0.18em" }}>
              DARK ROCK LABS
            </div>
          </div>
        </Link>
        <Link
          href="/"
          style={{ color: colors.textMuted, fontSize: 13, textDecoration: "none", fontFamily: "Figtree, sans-serif" }}
        >
          ← Back to home
        </Link>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: colors.panel,
            border: `1px solid ${colors.panelBorder}`,
            borderRadius: 16,
            padding: 36,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <RookLogo size={52} />
            <h1
              style={{
                fontFamily: "Figtree, sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: colors.text,
                margin: "16px 0 6px",
                letterSpacing: "-0.01em",
              }}
            >
              Sign in to Sentry
            </h1>
            <p style={{ color: colors.textMuted, fontSize: 14, margin: 0 }}>
              Enter your credentials to access the platform.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ color: colors.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", fontFamily: "Figtree, sans-serif" }}>
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    color: colors.textDim,
                    fontSize: 12,
                    fontFamily: "Figtree, sans-serif",
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(248, 113, 113, 0.08)",
                  border: "1px solid rgba(248, 113, 113, 0.32)",
                  color: colors.red,
                  fontSize: 13,
                  fontFamily: "Figtree, sans-serif",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 6,
                padding: "12px 16px",
                borderRadius: 10,
                background: submitting
                  ? "rgba(0, 180, 166, 0.45)"
                  : `linear-gradient(135deg, ${colors.teal}, #009A8E)`,
                color: "#0A0E14",
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? "wait" : "pointer",
                border: 0,
                fontFamily: "Figtree, sans-serif",
                letterSpacing: "0.02em",
                boxShadow: "0 4px 16px rgba(0, 180, 166, 0.28)",
              }}
            >
              {submitting ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: "center", color: colors.textDim, fontSize: 12, fontFamily: "Figtree, sans-serif" }}>
            Access is provisioned by Dark Rock Labs.
            <br />
            For a new account, contact{" "}
            <a href="mailto:support@darkrocksecurity.com" style={{ color: colors.tealLight, textDecoration: "none" }}>
              support@darkrocksecurity.com
            </a>
            .
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  background: "#0A0E14",
  border: "1px solid #1E293B",
  color: "#E2E8F0",
  fontSize: 14,
  fontFamily: "Source Sans 3, sans-serif",
  outline: "none",
};

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label style={{ display: "block", color: colors.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 6, fontFamily: "Figtree, sans-serif" }}>
        {label.toUpperCase()}
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} {...rest} style={inputStyle} />
    </div>
  );
}
