# Sentry — Platform overview for David

**From:** Alex Bates
**Subject:** Where Sentry is, where it's going, what's in your hands

This is the context doc. The tactical DNS work is in a separate file (**`DNS_RECORDS_TO_ADD.md`**) you can forward to whoever manages our domains. This one is for you — read it once and you'll have the full picture.

---

## What Sentry is right now

A multi-tenant SaaS cyber-resilience platform. Eighteen modules, full multi-tenant data isolation (RLS at Postgres, not just app-level), Supabase Auth + Postgres + Storage, deployed on Vercel.

- **Repo:** `github.com/DarkRockSecurity/sentry` (private, on `master`)
- **Current live URL:** `sentry-ruby-sigma.vercel.app`
- **After DNS work:** `sentry.darkrocklabs.com`
- **Vercel project:** `drcalexbates26s-projects/sentry`
- **Stack:** Next.js 16 (App Router, Turbopack) · Prisma 7 → Supabase Postgres · Zustand · Tailwind · Resend
- **Auto-deploy:** any push to `master` triggers a Vercel production build (~40s)

Health: build is green. There's no GitHub Actions CI yet (it's on the audit list).

---

## Your accounts (you, Jason, Steve)

Capture passwords from my previous message — they will NOT be re-shown anywhere.

| Name | Email | Tenant | Role |
|---|---|---|---|
| David Driggers | `david.driggers@darkrocksecurity.com` | `tenant_darkrock` | tenant_admin |
| Jason Clauer | `jason.clauer@darkrocksecurity.com` | `tenant_darkrock` | tenant_admin |
| Steve Proud | `steve.proud@darkrocksecurity.com` | `tenant_darkrock` | tenant_admin |
| Sentry Bot (system) | `sentry-bot@darkrocksecurity.com` | `tenant_demo` | tenant_admin |

- **Sign-in URL today:** `https://sentry-ruby-sigma.vercel.app/login`
- **Sign-in URL after DNS:** `https://sentry.darkrocklabs.com/login`
- **Please change your password on first sign-in** (Settings → Account). Same for Jason and Steve.
- The Sentry Bot account is used by the headless screenshot capture script only — leave it alone.

---

## What I need from you — in priority order

1. **DNS records.** Hand `DNS_RECORDS_TO_ADD.md` to whoever manages our zones. Five records total, 15 minutes of registrar work. The Resend step needs you to log into the Resend dashboard first to surface our unique DKIM key.
2. **Set the env vars in Vercel** once DNS is verified — `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM`, `CRON_SECRET`. Instructions at the bottom of `DNS_RECORDS_TO_ADD.md`.
3. **Read `THIRD_PARTY_REVIEW.md`** §2 (highest-priority gaps) and §11 (90-day priority stack). That's the technical-debt context for our roadmap conversations.

---

## What's already live in production

- **18 modules** end-to-end: Dashboard, Threat Intel, Onboarding, Assessment, IR Planner, Stakeholders, Policies, Commander, Incident Log, Tasks, Tickets, Forensics, Playbooks, Tabletop, Pen Testing, Integrations (now "Roadmap"), Comms, Access Control
- **Multi-tenant** Postgres with row-level security at the database layer
- **Threat intel** auto-refreshes every 2h via Vercel cron AND immediately when a user logs in (if the cache is stale)
- **18 preset playbooks** plus a full custom-playbook editor (Add new / Duplicate preset / Edit / Delete) — new playbooks shadow the preset, can be re-forked
- **Stakeholder → User invite flow** with recommended-role suggestions (lowest-privilege RBAC tier that covers the stakeholder's group)
- **Access Module "Add Member"** provisions a real Supabase user, not a Zustand-only entry
- **Light + dark theme** with hardened contrast on the in-app surfaces
- **Marketing site** at `/`, per-module SEO pages at `/modules/{id}` with branded OG images
- **Legal pages** `/privacy`, `/terms`, `/security` (GDPR/CCPA-aware language; sub-processor list at `/security#subprocessors`)
- **Sitemap, robots.txt, JSON-LD** structured data

---

## What's open — three docs in the repo to read

1. **`THIRD_PARTY_REVIEW.md`** — 13-section platform audit (security, perf, a11y, compliance, ops). Read §2 first.
2. **`QA_PUNCH_LIST.md`** — 45 in-app QA findings (P0–P3). The high-impact items (P0-2, P0-4, P0-5, P1-3, P1-5, P1-6, P1-7, P1-9) have been fixed. The rest of P1 (Comms rename to Roadmap, PenTesting validation, Tickets confirm) are scoped.
3. **`DEPLOYMENT.md`** + **`SUPABASE_SETUP.md`** — runbooks for re-deploying from scratch. Reference material only; you shouldn't need them unless we lose the project.

---

## Deployment workflow

Push to `master` → auto-deploy. The full loop:

```bash
git pull
# make changes
npm run build            # always verify locally first
git add .
git commit -m "feat: …"
git push origin master   # → live in ~40s
```

Preview builds run automatically on PRs. To check deploy status from the terminal:

```bash
npx vercel ls
npx vercel logs <deployment-url>
```

**Convention:** open a PR for risky changes (DB migrations, env var edits, anything touching auth) — never push directly to `master` for those. For copy fixes, UI tweaks, and the like, master-push is fine.

---

## Vercel env vars — current state

Open `vercel.com/drcalexbates26s-projects/sentry/settings/environment-variables`. These should all exist for **Production**:

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase pgbouncer URL | ✓ Set |
| `DIRECT_URL` | Supabase direct URL | ✓ Set — used by migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✓ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✓ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | ✓ Set — server-only, never expose to client |
| `RESEND_API_KEY` | Resend send-only key | ✓ Set |
| `EMAIL_FROM` | `Sentry by Dark Rock <noreply@darkrocksecurity.com>` | **Update after Resend verified** |
| `NEXT_PUBLIC_APP_URL` | `https://sentry.darkrocklabs.com` | **Update after DNS verified** |
| `CRON_SECRET` | `openssl rand -hex 32` output | **Set this — required for production cron auth** |
| `NVD_API_KEY` | Optional — nvd.nist.gov/developers | Bumps NVD rate limit. Nice-to-have. |

---

## Recommended next priorities (your Monday)

1. **DNS + Resend** — get us off the Vercel-default URL and onto a verified sender domain. Biggest visible upgrade for the smallest amount of work. (`DNS_RECORDS_TO_ADD.md`)
2. **`THIRD_PARTY_REVIEW.md` §2** — CI gates, observability, rate-limiting, CSP. All of these unblock SOC 2 evidence.
3. **Remaining P1 items in `QA_PUNCH_LIST.md`** — half a day of UX polish.
4. **Decide on the Comms module** — currently renamed "Roadmap". Build the Slack/Teams/PagerDuty integrations next quarter, or scope down to email-only.
5. **Sign Supabase + Vercel BAAs** — required before we can claim HIPAA-compliance to a customer. Each is a 24-hour turnaround on the enterprise plan.

---

## Where to find me

- Code: `github.com/DarkRockSecurity/sentry`
- Live (current): `https://sentry-ruby-sigma.vercel.app`
- Live (after DNS): `https://sentry.darkrocklabs.com`
- Support: `support@darkrocksecurity.com`
- Security disclosures: `security@darkrocksecurity.com`
- Me: alex@darkrocksecurity.com

Anything in this doc unclear, ping me directly. I'd rather answer one question than have you guess.

— Alex
