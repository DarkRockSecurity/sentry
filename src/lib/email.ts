// Non-auth email sender (notifications, alerts, custom comms).
//
// Auth emails (invites, magic links, password resets) ride Supabase's
// SMTP — see SUPABASE_SETUP.md step 5. This module is for everything
// else: incident comms drafts, breach notification packets, scheduled
// digest emails, and so on.
//
// Set RESEND_API_KEY + EMAIL_FROM in env to activate. If unset, sendEmail
// returns { ok: false, reason: "not_configured" } without throwing —
// callers can degrade gracefully.

import { Resend } from "resend";

let cachedClient: Resend | null = null;

function client(): Resend | null {
  if (cachedClient) return cachedClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cachedClient = new Resend(key);
  return cachedClient;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  /** HTML body. Rendered as the email body. */
  html?: string;
  /** Plain-text fallback. Recommended for deliverability. */
  text?: string;
  /** Override the configured EMAIL_FROM for this send. */
  from?: string;
  replyTo?: string;
  /** Tags / metadata for tracking. */
  tags?: { name: string; value: string }[];
}

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not_configured"; error?: string }
  | { ok: false; reason: "send_failed"; error: string };

/** Sends a non-auth email via Resend. Returns { ok: false, reason: "not_configured" }
 *  if RESEND_API_KEY/EMAIL_FROM aren't set — callers should treat that as a no-op. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const c = client();
  if (!c) return { ok: false, reason: "not_configured" };

  const from = input.from || process.env.EMAIL_FROM;
  if (!from) return { ok: false, reason: "not_configured", error: "EMAIL_FROM not set" };

  if (!input.html && !input.text) {
    return { ok: false, reason: "send_failed", error: "Either html or text is required" };
  }

  try {
    const result = await c.emails.send({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html ?? "",
      text: input.text,
      replyTo: input.replyTo,
      tags: input.tags,
    });
    if (result.error) return { ok: false, reason: "send_failed", error: result.error.message };
    return { ok: true, id: result.data?.id ?? "" };
  } catch (e) {
    return { ok: false, reason: "send_failed", error: (e as Error).message };
  }
}

/** True if non-auth email is configured and ready. Useful for hiding UI
 *  affordances when the feature can't be used. */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
