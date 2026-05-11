# DNS records to add — Sentry production rollout

**For:** Whoever manages the `darkrocklabs.com` and `darkrocksecurity.com` zones at the registrar
**Total records to add:** 5 (one for hosting, four for email)
**Estimated time:** 15 minutes at the registrar, 10–30 minutes for DNS propagation

Add the records below, then run the verification command at the bottom.

---

## A) Host the Sentry app on `sentry.darkrocklabs.com`

Add this one record on the **`darkrocklabs.com`** zone:

| # | Type | Host / Name | Value | TTL |
|---|---|---|---|---|
| 1 | CNAME | `sentry` | `cname.vercel-dns.com` | 3600 (or auto) |

> **Alternative — apex domain.** If you want Sentry to live at `darkrocklabs.com` itself (no `sentry.` prefix), use these two records instead of the one above:
>
> | Type | Host | Value | TTL |
> |---|---|---|---|
> | A | `@` | `76.76.21.21` | 3600 |
> | CNAME | `www` | `cname.vercel-dns.com` | 3600 |

After this propagates, Vercel will auto-issue a Let's Encrypt cert. Then the app is reachable at `https://sentry.darkrocklabs.com`.

---

## B) Verify `darkrocksecurity.com` as a Resend sender domain

**Important — first** log into **`resend.com/domains`** with the team Resend account and:

1. Click **Add Domain** → enter `darkrocksecurity.com` → Region: `us-east-1` → Add.
2. Resend will show you four DNS records with your domain's exact DKIM key and SPF values. **Copy the values from the Resend UI** — the table below shows the shape but the DKIM string is unique per domain.

Then add these four records on the **`darkrocksecurity.com`** zone:

| # | Type | Host / Name | Value (copy exact from Resend UI) | TTL | Purpose |
|---|---|---|---|---|---|
| 2 | TXT | `send` | `v=spf1 include:amazonses.com ~all` | 3600 | SPF |
| 3 | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA…` *(long key, copy from Resend)* | 3600 | DKIM |
| 4 | MX | `send` | Priority `10`, value `feedback-smtp.us-east-1.amazonses.com` | 3600 | Bounce routing |
| 5 | TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@darkrocksecurity.com` | 3600 | DMARC (recommended) |

> **About "Host / Name" column.** Some registrars want the bare subdomain (e.g. `send`), others want the FQDN (`send.darkrocksecurity.com`). Both work. If unsure, use the bare form — most registrars append the zone automatically.

After all four are in place, back in Resend click **Verify domain** on `darkrocksecurity.com`. It should flip from "Pending" to "Verified" within a few minutes.

---

## C) Verify everything from the command line

Once you believe all records are in, run from the project directory:

```bash
# App hosting
npm run check:dns -- --domain sentry.darkrocklabs.com

# Sender domain
npm run check:dns -- --domain sentry.darkrocklabs.com --email darkrocksecurity.com
```

You want a green ✓ on every line. If anything reports ✕ or ⚠ after 30 minutes, the record didn't land — double-check the registrar.

---

## D) After DNS is green — Vercel env vars

Open `vercel.com/drcalexbates26s-projects/sentry/settings/environment-variables` → **Production** and update:

| Variable | New value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://sentry.darkrocklabs.com` |
| `EMAIL_FROM` | `Sentry by Dark Rock <noreply@darkrocksecurity.com>` |
| `CRON_SECRET` | A long random string (e.g. `openssl rand -hex 32` output) |

Then redeploy — Deployments tab → most-recent → **⋯** → **Redeploy**.

That's it. The platform is then live on `https://sentry.darkrocklabs.com` sending email from `noreply@darkrocksecurity.com`.

---

**Questions:** alex@darkrocksecurity.com
