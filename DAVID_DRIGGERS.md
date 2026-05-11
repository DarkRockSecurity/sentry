# David — DNS + Email setup for Sentry

**To:** David Driggers
**From:** Alex Bates
**Time required:** ~25 minutes at the registrar + ~30 minutes for DNS to propagate
**Outcome:** Sentry is live at `https://sentry.darkrocklabs.com` and sends real emails from `noreply@darkrocksecurity.com`.

Three things need to happen, in this order:

1. **DNS records at the registrar** — one record for hosting, four for email
2. **Verify the domain in Resend** — click "Verify" once DNS lands
3. **Vercel env vars + redeploy** — point the app at the new URL and sender

After step 3, run the test command at the bottom and a real email lands in your inbox.

---

## 1) DNS records

You're going to add records on **two** zones at the registrar:
- `darkrocklabs.com` (1 record) — to host the Sentry app
- `darkrocksecurity.com` (4 records) — to verify the email sender

### 1A · Host the Sentry app

Add this **one** record on the `darkrocklabs.com` zone:

| Type | Host / Name | Value | TTL |
|---|---|---|---|
| CNAME | `sentry` | `cname.vercel-dns.com` | 3600 (or auto) |

This makes `https://sentry.darkrocklabs.com` resolve to the Vercel deployment. Vercel will auto-issue a Let's Encrypt cert within a few minutes after the record lands.

> If you instead want Sentry at the apex (`darkrocklabs.com` itself, no subdomain), use these two records instead of the one above. Most companies keep the marketing site at apex and put the app on a subdomain — recommended path is the table above.
>
> | Type | Host | Value |
> |---|---|---|
> | A | `@` | `76.76.21.21` |
> | CNAME | `www` | `cname.vercel-dns.com` |

### 1B · Verify the email sender domain in Resend

Before adding records, you need to **register the domain in Resend's dashboard** so it shows you the exact DKIM key for your account.

**At resend.com/domains:**
1. Sign in with the team Resend account.
2. Click **Add Domain** → enter `darkrocksecurity.com` → Region: `us-east-1` → **Add**.
3. Resend will now display four DNS records with copy buttons. Keep this tab open — those are the values you'll paste at the registrar.

**At the registrar** (`darkrocksecurity.com` zone), add the four records Resend just showed you. The shape will look like this — but **the DKIM key value is unique to your domain, so copy it from Resend, not from this table**:

| # | Type | Host / Name | Value | Purpose |
|---|---|---|---|---|
| 1 | TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF — proves Sentry is authorized to send |
| 2 | TXT | `resend._domainkey` | *(long DKIM key — copy from Resend UI)* | DKIM — cryptographic signature on every message |
| 3 | MX | `send` | Priority `10`, target `feedback-smtp.us-east-1.amazonses.com` | Bounce / complaint routing |
| 4 | TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:postmaster@darkrocksecurity.com` | DMARC — rejects spoofed mail (recommended) |

> **About "Host / Name".** Some registrars want the bare subdomain (e.g. `send`), others want the FQDN (`send.darkrocksecurity.com`). Both work. If unsure, paste the bare form — most registrars auto-append the zone.

**Once all four records are in**, go back to Resend → `darkrocksecurity.com` → click **Verify domain**. It should flip from "Pending" to **Verified** within a few minutes. If it stays Pending after 30 minutes, the records didn't land correctly — go back to the registrar and confirm.

---

## 2) Verify everything from the command line

Once you believe DNS is in place, clone the repo (or `git pull` if already cloned) and run:

```bash
# App hosting
npm run check:dns -- --domain sentry.darkrocklabs.com

# Sender domain
npm run check:dns -- --domain sentry.darkrocklabs.com --email darkrocksecurity.com
```

You want a green ✓ on every line. The output reads:

- ✓ CNAME → cname.vercel-dns.com
- ✓ HTTPS reachability
- ✓ SPF includes Resend
- ✓ DKIM resend._domainkey
- ✓ DKIM send._domainkey  *(Resend uses both selectors)*
- ✓ DMARC present (recommended)

If you see a ✕ or ⚠, it's almost always a registrar issue — re-check the exact value and the `Host / Name` field.

---

## 3) Vercel environment variables

Open the Vercel project: `vercel.com/drcalexbates26s-projects/sentry/settings/environment-variables`.

Make sure these three are set for **Production**:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://sentry.darkrocklabs.com` | The public URL the app advertises to users |
| `EMAIL_FROM` | `Sentry by Dark Rock <noreply@darkrocksecurity.com>` | Branded sender — only works after Resend verifies the domain |
| `RESEND_API_KEY` | *(already set)* | Restricted "send-only" API key generated for the platform |

After saving:
1. Go to **Deployments**
2. Click the **⋯** on the most-recent production deploy
3. **Redeploy** (uncheck "Use existing Build Cache" so the new env vars are baked in)

The new deploy takes ~40 seconds.

---

## 4) Send a real test email

From the project root (your machine, not Vercel):

```bash
npm run test:email -- --to david.driggers@darkrocksecurity.com --kind notification
```

You should receive an email from `Sentry by Dark Rock <noreply@darkrocksecurity.com>` within 30 seconds. Inspect the headers:

- **From:** `Sentry by Dark Rock <noreply@darkrocksecurity.com>` ✓
- **Authentication-Results:** `spf=pass` AND `dkim=pass` ✓ — proves §1B records are correct
- **Received-SPF:** `Pass` ✓

If `spf=fail` or `dkim=fail`, the DNS check probably passed but Resend's verification didn't propagate — wait 15 minutes and try again. If still failing, ping me.

You can also send other kinds:

```bash
npm run test:email -- --to <addr> --kind digest          # weekly digest format
npm run test:email -- --to <addr> --kind plain           # plain-text fallback
```

---

## 5) After it works — what email Sentry actually sends

Once verified, the platform sends from `noreply@darkrocksecurity.com` automatically in these flows:

| Trigger | Recipient | Template |
|---|---|---|
| Admin invites a new tenant user | New user | Magic-link sign-in |
| Stakeholder is promoted to a Sentry user | Stakeholder | Magic-link sign-in |
| Cron at 09:00 UTC Monday | Tenant admin | Weekly digest of incidents + threat-intel |
| Pen-test request submitted | `pentest@darkrocksecurity.com` | Internal routing email |
| Assessment report emailed from the Assessment module | Recipient list | Branded report attachment |
| Incident notification sent from the Notifications widget | Recipient list | Classification-banner template |

---

## Troubleshooting

**"Domain stuck on Pending in Resend"**
- 90% of the time the DKIM CNAME has a typo or the wrong host prefix. Click Verify again 5 minutes after re-pasting from Resend.

**"Email lands in spam"**
- Make sure DMARC (record #4) is in place — that's the biggest deliverability lift.
- Resend has a sender-reputation page that shows bounce / complaint rates; check there if deliverability is low.

**"Cron isn't firing the weekly digest"**
- Set `CRON_SECRET` in Vercel env (use `openssl rand -hex 32` to generate). Without it the cron route accepts any request — fine for dev, but Vercel's cron will send the secret so add it.

**"I broke the DNS, how do I roll back the hosting?"**
- Delete the new CNAME `sentry` record. The Vercel project keeps serving from `sentry-ruby-sigma.vercel.app` regardless of what the registrar says — the app stays up.

---

## Quick reference — what gets touched

| Where | What you change |
|---|---|
| Registrar — `darkrocklabs.com` zone | 1 CNAME (`sentry` → cname.vercel-dns.com) |
| Registrar — `darkrocksecurity.com` zone | 4 records (SPF, DKIM, MX, DMARC) from Resend |
| `resend.com/domains` | Add `darkrocksecurity.com`, click Verify after DNS lands |
| Vercel env vars | `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM` |
| Vercel | Redeploy production once env vars are saved |

**Questions:** alex@darkrocksecurity.com — I'll be available the day you do this.
