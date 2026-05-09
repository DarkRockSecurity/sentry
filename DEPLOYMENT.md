# Deploying Sentry to Vercel

End-to-end deployment guide. Pre-reqs: a Supabase project (see `SUPABASE_SETUP.md`) and a Vercel account.

## 1. Push to GitHub

```bash
git remote add origin git@github.com:DarkRockSecurity/sentry.git
git push -u origin master
```

## 2. Import to Vercel

1. **Vercel Dashboard → Add New → Project**
2. Pick the GitHub repo (`DarkRockSecurity/sentry`)
3. Framework preset: **Next.js** (auto-detected via `vercel.json`)
4. Build command: `prisma generate && next build` (already set in `vercel.json`)
5. Install command: `npm install`
6. Output directory: `.next` (default)
7. Root directory: `.`
8. Don't deploy yet — set env vars first.

## 3. Environment variables

In **Project Settings → Environment Variables**, add the following for **Production** (and optionally Preview):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase → Project Settings → API | safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase → Project Settings → API | safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase → Project Settings → API | **secret** — server only |
| `DATABASE_URL` | Supabase pooled URL (port 6543) with `?pgbouncer=true&connection_limit=1` | runtime queries |
| `SUPABASE_DIRECT_URL` | Supabase direct URL (port 5432) | only used if you ever run `prisma migrate` from Vercel |
| `NEXT_PUBLIC_APP_URL` | `https://sentry.darkrocklabs.com` | absolute URL the app is served from; used by magic-link `redirectTo` |
| `NEXTAUTH_URL` | `https://sentry.darkrocklabs.com` | legacy alias kept for fallback in some helpers |
| `NEXTAUTH_SECRET` | random 48+ byte base64 | left over from the auth migration; safe to remove if you never reused it |
| `RESEND_API_KEY` | optional — only if you wire `lib/email.ts` for non-auth emails | |
| `EMAIL_FROM` | `"Sentry by Dark Rock <noreply@darkrocksecurity.com>"` | sender for non-auth emails |
| `NVD_API_KEY` | optional — pulls higher rate-limit feed | |
| `THREAT_INTEL_CRON` | `true` | enables the `/api/cron/threat-intel` endpoint |
| `CRON_SECRET` | random string | protects the cron endpoint |

**Tip:** the easiest path is to install Vercel's Supabase integration. **Vercel → Storage → Connect Store → Supabase** auto-provisions
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`. Then alias:

- `DATABASE_URL = POSTGRES_URL`
- `SUPABASE_DIRECT_URL = POSTGRES_URL_NON_POOLING`

## 4. First deploy

Click **Deploy**. Vercel will:

1. `npm install` — installs Prisma, Supabase clients, etc.
2. `prisma generate` — produces the typed client
3. `next build` — builds the app
4. Provisions the function regions (default `iad1`)

## 5. Post-deploy: schema + RLS

Run migrations from your local machine against the production database (Supabase project):

```bash
DATABASE_URL="$POSTGRES_URL_NON_POOLING" npx prisma migrate dev --name init
```

Then apply RLS in Supabase SQL editor: paste `prisma/rls.sql` → Run.

If you've already done this for your dev project, you can skip — Supabase env vars are per-project, so you may need a second project for prod. (Recommended pattern.)

## 6. Configure custom domain

1. **Vercel → Project → Settings → Domains → Add**
2. Enter `sentry.darkrocklabs.com`
3. Add the CNAME or A record Vercel shows you to your DNS provider:
   - `sentry.darkrocklabs.com` → `cname.vercel-dns.com` (CNAME)
4. Verify in Vercel; SSL provisions automatically (~1 min)
5. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` env vars to the custom domain
6. **Supabase → Authentication → URL Configuration:**
   - Site URL: `https://sentry.darkrocklabs.com`
   - Redirect URLs: add `https://sentry.darkrocklabs.com/auth/callback`
7. Trigger a redeploy so env vars are picked up

## 7. Smoke test

Visit `https://sentry.darkrocklabs.com/login`, sign in with your super-admin
credentials, confirm `/admin/demo` works, and provision a test demo session.

## Cron jobs

`vercel.json` already declares the threat-intel cron at `/api/cron/threat-intel`
running every 6 hours. Vercel's Cron Jobs only run on the **Pro plan or above**.
On the free Hobby tier the job is silently skipped — same code path remains
callable manually for testing.

## Branded sender for invitation emails

Magic-link / invite emails go through **Supabase Auth's SMTP**, not your app's
SMTP. To customize:

1. Verify your sending domain in your transactional email provider (Resend, SES, Postmark, SendGrid)
2. **Supabase → Project Settings → Authentication → SMTP Settings**:
   - Enable Custom SMTP
   - Sender name: `Sentry by Dark Rock Labs`
   - Sender email: `noreply@darkrocksecurity.com`
   - Host / port / username / password from your provider
3. **Supabase → Authentication → Email Templates** — customize the **Invite user** and **Magic Link** templates
   - Use the `{{ .ConfirmationURL }}` placeholder for the sign-in link
   - Brand the body with the Aurora Teal palette and Sentry rook
4. Send a test invite from `/admin/demo` to verify deliverability

## Rollback

- **Vercel → Project → Deployments → Promote** any prior deployment to instantly roll back
- For schema rollbacks, keep `prisma/migrations/` under version control — `prisma migrate resolve` can pin to a known state
