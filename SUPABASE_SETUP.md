# Supabase Setup

End-to-end steps to wire Sentry to a fresh Supabase project. Allow ~15 minutes.

## 1. Create the project

Easiest path is the Vercel + Supabase integration (auto-provisions env vars):

1. Open the Vercel project → **Storage** → **Create Database** → **Supabase**.
2. Pick a region close to your users and a strong DB password (Vercel saves it).
3. Vercel will set these env vars on every environment automatically:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `POSTGRES_URL` (connection-pooler URL)
   - `POSTGRES_URL_NON_POOLING` (direct URL)
4. Pull them locally: `vercel env pull .env`
5. Add `DATABASE_URL` to `.env` pointing at the pooled Postgres URL:
   `DATABASE_URL=$POSTGRES_URL` (or copy the value Vercel set on `POSTGRES_URL`).
   Keep `POSTGRES_URL_NON_POOLING` around — you'll need it for migrations.

> Manual alternative: create the project at supabase.com, copy the values from
> Project Settings → API + Project Settings → Database into `.env` matching
> the names in `.env.example`.

## 2. Apply the database schema

Migrations need the **direct** (non-pooled) Postgres URL — pgbouncer can't run
DDL. Temporarily point `DATABASE_URL` at the direct URL while running migrate:

```bash
# One-off: run migrations against the direct URL
DATABASE_URL="$POSTGRES_URL_NON_POOLING" npx prisma migrate dev --name init
DATABASE_URL="$POSTGRES_URL_NON_POOLING" npx prisma migrate deploy
npx prisma generate
```

Leave the pooled URL as the default `DATABASE_URL` so the running app uses it.

## 3. Apply Row-Level Security policies

Open **Supabase → SQL Editor → New query**, paste `prisma/rls.sql`, click **Run**.

Re-run this any time you add a new tenant-scoped table.

## 4. Create your first super-admin

1. **Supabase → Authentication → Users → Add user**. Enter your email + a password.
   (Disable "Auto-confirm email" off if you want the magic link, on for instant access.)
2. Open `prisma/bootstrap.sql`. Change the `v_email` line to your email.
3. Run the whole file in the SQL Editor.
4. This creates two tenants (`Dark Rock Labs` and the demo tenant) and promotes
   your auth user to `super_admin` under the Dark Rock tenant.

## 5. Configure SMTP for invitation emails

The admin console can send invitation / magic-link emails to prospects and new users. Supabase delivers these — you just need SMTP configured.

**Quick (test) path — Supabase default sender:**
- Works out of the box; no config needed.
- Limited to **4 emails/hour** total across the project.
- Uses a `noreply@mail.app.supabase.io`-style sender (not great for prospect-facing demos).
- Fine for local dev, smoke tests, and your own admin email.

**Production path — custom SMTP via Supabase:**

1. Sign up for an SMTP provider:
   - **Resend** (free tier: 100/day, 3,000/month) — easiest, recommended
   - **AWS SES**, **Postmark**, **SendGrid**, or any standards-compliant SMTP host
2. Verify your sending domain (e.g. `darkrocklabs.com`) — DNS SPF/DKIM records
3. In **Supabase → Project Settings → Authentication → SMTP Settings**:
   - Enable Custom SMTP
   - Sender name: `Sentry by Dark Rock Labs`
   - Sender email: `noreply@darkrocklabs.com` (must match verified domain)
   - SMTP host / port / username / password — provider-specific
   - Save
4. (Optional) Customize email templates in **Project Settings → Authentication → Email Templates**:
   - **Invite user** — sent when admin onboards a new user via the admin console
   - **Magic Link** — sent on resend
5. Add your application URL to **Project Settings → Authentication → URL Configuration**:
   - **Site URL**: `https://sentry.darkrocklabs.com` (or `http://localhost:3000` for dev)
   - **Redirect URLs**: include `http://localhost:3000/auth/callback` and the production callback

Supabase rejects redirects to URLs not on the allow-list, so the magic-link click would fail to land on `/app` without this.

## 6. Sign in

```bash
npm run dev
```

Hit `http://localhost:3000/login`, sign in with the credentials from step 4.

## 7. (Optional) Seed the demo tenant

Once the admin console is wired (next phase), there'll be a one-click "reset
demo" command. Until then, demo data lives only in Zustand and is per-browser.

---

## Reference: where things live

| Concern               | File                                       |
|-----------------------|--------------------------------------------|
| Prisma schema         | `prisma/schema.prisma`                     |
| RLS policies          | `prisma/rls.sql`                           |
| Bootstrap (1st admin) | `prisma/bootstrap.sql`                     |
| Server Supabase client | `src/lib/supabase/server.ts`              |
| Browser Supabase client | `src/lib/supabase/client.ts`             |
| Session refresh middleware | `src/lib/supabase/middleware.ts`      |
| Login form            | `src/app/login/LoginForm.tsx`              |
| Auth callback         | `src/app/auth/callback/route.ts`           |
| Sign-out              | `src/app/auth/signout/route.ts`            |

## Reference: what changed from the env-credentials build

- Removed: `next-auth`, `bcryptjs`, `src/components/auth/`, `src/app/api/auth/`,
  `src/lib/auth.ts`, the `SessionProvider` wrap in `app/layout.tsx`.
- Added: Supabase SSR client + middleware, real multi-user auth, tenant scoping
  in the schema.
- Old `SENTRY_AUTH_USER_EMAIL` / `_PASSWORD_HASH` env vars are no longer read
  and can be deleted.
