# Sentry — Handoff brief for David Driggers

**From:** Alex Bates
**Subject:** Get Sentry live on `darkrocklabs.com` + Resend sender domain wired up

This is a one-pass brief. Everything you need to act is in here; nothing is hidden behind a meeting. Read end-to-end once — should take about 10 minutes — then work top-down. Pings welcome.

---

## TL;DR

We need three things done to take Sentry from "deployed on a Vercel preview URL" to "production-ready under our domain":

1. **Add Vercel as the host of `sentry.darkrocklabs.com`** (or apex `darkrocklabs.com` — your call on which) — 5 DNS records at the registrar.
2. **Verify `darkrocksecurity.com` as a Resend sender domain** — 4 DNS records at the registrar.
3. **Set the new env vars in Vercel** (`NEXT_PUBLIC_APP_URL`, `EMAIL_FROM`) so the platform knows its public URL and signs emails correctly.

Everything else is wired. Total registrar work is ~9 DNS records.

---

## 1. What Sentry is right now

A multi-tenant SaaS cyber-resilience platform. Eighteen modules, full multi-tenant data isolation (RLS at Postgres, not just app-level), Supabase Auth + Postgres + Storage, deployed on Vercel.

**Repo:** `github.com/drcalexbates26/sentry` (private, on `master`)
**Current live URL:** `sentry-ruby-sigma.vercel.app` (Vercel-default — no custom domain yet)
**Vercel project:** `drcalexbates26s-projects/sentry`
**Vercel org:** `drcalexbates26s-projects`

**Tech:** Next.js 16 (App Router, Turbopack), Prisma 7 → Supabase Postgres, Zustand, TailwindCSS, Resend for transactional email.

**Health:** build is green, CI is local-only for now (no GitHub Actions yet — flagged in `THIRD_PARTY_REVIEW.md`). Auto-deploy from `master` to Vercel production is live.

---

## 2. Your accounts

You and the team have credentials. Capture these from the previous message — they are NOT shown anywhere else.

| Name | Email | Tenant | Role |
|---|---|---|---|
| David Driggers | `david.driggers@darkrocksecurity.com` | `tenant_darkrock` | tenant_admin |
| Jason Clauer | `jason.clauer@darkrocksecurity.com` | `tenant_darkrock` | tenant_admin |
| Steve Proud | `steve.proud@darkrocksecurity.com` | `tenant_darkrock` | tenant_admin |
| Sentry Bot (system) | `sentry-bot@darkrocksecurity.com` | `tenant_demo` | tenant_admin |

**Sign-in URL today:** `https://sentry-ruby-sigma.vercel.app/login`
**Sign-in URL after step 3 below:** `https://sentry.darkrocklabs.com/login`

Please **change your password on first sign-in** — Settings → Account. The team should do the same.

The Sentry Bot account is used by the headless screenshot capture script only — leave it alone.

---

## 3. Hosting on `darkrocklabs.com` — DNS step

You have two reasonable choices. Pick one:

### Option A — Subdomain (`sentry.darkrocklabs.com`) — **recommended**
Leaves `darkrocklabs.com` apex free for the marketing site (which is separate from Sentry).

At your registrar, add **one** record on `darkrocklabs.com`:

```
Type:  CNAME
Name:  sentry
Value: cname.vercel-dns.com
TTL:   3600 (or auto)
```

### Option B — Apex (`darkrocklabs.com` itself)
If you want Sentry to BE the company site, replace whatever points at `darkrocklabs.com` today. Vercel apex needs an A record (CNAME on apex doesn't work per RFC):

```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   3600
```

Plus a CNAME on `www` to redirect to apex:

```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
TTL:   3600
```

### Then in Vercel:

1. Go to `vercel.com/drcalexbates26s-projects/sentry/settings/domains`
2. Click **Add Domain** → enter the chosen domain (e.g. `sentry.darkrocklabs.com`).
3. Vercel auto-issues a Let's Encrypt cert once it sees the DNS record propagate (1–10 min). You'll see a green check.
4. Mark it **Production** (it will be by default for the first domain you add).

**Verify the DNS first**:

```
cd C:\Users\alexa\sentry
npm run check:dns -- --domain sentry.darkrocklabs.com
```

Green check across the board = ready. Yellow ⚠ on the Vercel CNAME = propagation pending, retry in 5 min.

---

## 4. Resend — email sender domain

**Background:** Sentry sends three kinds of email — assessment reports, weekly digests, and incident notifications. They currently go from `noreply@<unverified>` which routes through Resend's shared `onboarding.resend.dev` sender — looks unprofessional and lands in spam more often.

**Goal:** send from `Sentry by Dark Rock <noreply@darkrocksecurity.com>`.

### Step 4a — In the Resend dashboard

The API key in our `.env` is `restricted` (send-only) — it can't add domains. Use the Resend UI:

1. Log in at **resend.com/domains** with the team Resend account.
2. Click **Add Domain** → enter `darkrocksecurity.com` → Region: `us-east-1` → Add.
3. Resend will show you **four DNS records** to add at your registrar. They look like this (your exact values will differ — copy from the Resend UI, not from here):

| Type | Name | Value | Purpose |
|---|---|---|---|
| TXT | `send.darkrocksecurity.com` | `v=spf1 include:amazonses.com ~all` | SPF (proves we're authorized to send) |
| TXT | `resend._domainkey.darkrocksecurity.com` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA…` (long key) | DKIM (signs each message cryptographically) |
| MX | `send.darkrocksecurity.com` | `10 feedback-smtp.us-east-1.amazonses.com` | Bounce/complaint routing |
| TXT (optional but **recommended**) | `_dmarc.darkrocksecurity.com` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@darkrocksecurity.com` | DMARC policy (rejects spoofed mail) |

4. Add all four at the registrar.
5. Wait 5–30 min for propagation, then back in Resend click **Verify domain**.

### Step 4b — Verify from CLI

We have a script that does the DNS sanity-check end-to-end:

```
npm run check:dns -- --domain sentry.darkrocklabs.com --email darkrocksecurity.com
```

You want ✓ on every line. If SPF or DKIM is ✕ after 30 min, the record didn't land at the registrar — go back and double-check.

### Step 4c — Flip the From address

Once verified, update the env var in Vercel (project settings → Environment Variables, both Production and Preview):

```
EMAIL_FROM=Sentry by Dark Rock <noreply@darkrocksecurity.com>
```

Redeploy (just bump any commit, or click "Redeploy" on the latest deploy in Vercel). Send yourself a test:

```
npm run test:email -- --to david.driggers@darkrocksecurity.com --kind notification
```

You should receive a properly DKIM-signed email from `noreply@darkrocksecurity.com`.

---

## 5. Vercel environment variables you need to set

Open `vercel.com/drcalexbates26s-projects/sentry/settings/environment-variables` and ensure these exist for **Production**. Any that already exist, leave alone unless you want to rotate.

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase project Connection Pooling URL (pgbouncer) | ✓ Already set |
| `DIRECT_URL` | Supabase Direct Connection URL | ✓ Already set — used by migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✓ Already set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | ✓ Already set |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | ✓ Already set — secret, never expose to the client |
| `RESEND_API_KEY` | Resend send-only API key | ✓ Already set |
| `EMAIL_FROM` | `Sentry by Dark Rock <noreply@darkrocksecurity.com>` | **Update after §4** |
| `NEXT_PUBLIC_APP_URL` | `https://sentry.darkrocklabs.com` (or whatever you chose in §3) | **Update after §3** |
| `CRON_SECRET` | Long random string — Vercel cron uses this in `Authorization: Bearer …` | ⚠ Set this. Currently optional but should be set for production. |
| `NVD_API_KEY` | Optional — register at nvd.nist.gov/developers | Bumps NVD rate limit from 5 req/30s to 50 req/30s. Nice-to-have. |

After any env change, click **Deploy** on the latest commit so it picks up.

---

## 6. What's already live in production

Stuff that already works on the current Vercel URL (and will keep working under `sentry.darkrocklabs.com` once §3 is done):

- 18 modules end-to-end (Dashboard, Threat Intel, Onboarding, Assessment, IR Planner, Stakeholders, Policies, Commander, Incident Log, Tasks, Tickets, Forensics, Playbooks, Tabletop, Pen Testing, Integrations, Comms, Access Control)
- Multi-tenant Postgres + row-level security
- Threat intel auto-refreshes every 2h via Vercel cron, and immediately on user login if cache is stale
- 18 preset playbooks + custom playbook editor (Add new / Duplicate preset / Edit / Delete)
- Stakeholder → user invite flow with recommended role (lowest-privilege RBAC tier that covers the stakeholder's group)
- Access Module "+ Add Member" provisions a real Supabase user, not just a Zustand entry
- Light/dark theme with hardened contrast on the in-app surfaces
- Marketing site at `/`, per-module SEO pages at `/modules/{id}` with branded OG images
- Legal pages `/privacy`, `/terms`, `/security` with GDPR/CCPA-aware language
- Sitemap, robots.txt, structured-data JSON-LD

---

## 7. What's open — three docs to read

In repo root:

1. **`THIRD_PARTY_REVIEW.md`** — 13-section platform audit (security, perf, a11y, compliance, ops). Read sections 2 (highest-priority gaps) and 4 (security). The next 90-day stack is in §11.
2. **`QA_PUNCH_LIST.md`** — 45 in-app QA findings (P0–P3). Items P0-2, P0-4, P0-5, P1-3, P1-5, P1-6, P1-7, P1-9 have already been fixed. The rest of P1 (assessment threshold, Comms rename to Roadmap, PenTesting validation) are open.
3. **`DEPLOYMENT.md`** + **`SUPABASE_SETUP.md`** — runbooks for re-deploying from scratch. You shouldn't need these unless we lose the project.

---

## 8. Deployment workflow

Auto-deploy is connected: any push to `master` triggers a Vercel production build.

```
git pull
# make changes
npm run build            # always verify locally first
git add .
git commit -m "feat: …"
git push origin master   # → deploys live in ~40s
```

Preview builds run automatically on PRs.

To check deploy status without leaving the terminal:

```
npx vercel ls
npx vercel logs <deployment-url>
```

**Don't** push directly to `master` for risky changes — open a PR, let the preview build run, click through the preview URL, then merge.

---

## 9. Recommended next session priorities

What I'd tackle on Monday in order of payoff:

1. **§3 + §4 from this doc** — get us off the Vercel-default URL and onto a verified sender domain. Highest visible upgrade for the smallest amount of work.
2. **§2 of `THIRD_PARTY_REVIEW.md`** — the 30-day priority stack (CI gates, observability, rate-limiting, CSP). All of these unblock SOC 2 evidence.
3. **The remaining P1 items in `QA_PUNCH_LIST.md`** — the assessment-threshold messaging fix and the PenTesting form validation should ship in the same PR. Half a day.
4. **Decide on Comms module** — it's now hidden as `Roadmap`. Either we build the Slack/Teams/PagerDuty integrations next quarter, or we rename to "Notifications" and limit scope to email.
5. **Sign a Supabase + Vercel BAA** — we can't claim HIPAA-compliance to a customer without both. Each one is a 24-hour turnaround on the enterprise plan.

---

## 10. Where to find me

- Code: `github.com/drcalexbates26/sentry`
- Live: `https://sentry-ruby-sigma.vercel.app` (now), `https://sentry.darkrocklabs.com` (after §3)
- Support: `support@darkrocksecurity.com`
- Security disclosures: `security@darkrocksecurity.com`

If anything in this doc is unclear, ping me directly — I'd rather answer one question than have you guess.

— Alex
