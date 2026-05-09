-- ─────────────────────────────────────────────────────────────────────
-- Row-Level Security policies for Sentry multi-tenancy.
--
-- Run this AFTER `prisma migrate deploy` so the tables exist.
-- Run it again any time you add a new tenant-scoped table.
--
-- Conventions:
--   • Every tenant-scoped table has a `tenantId` column.
--   • A user's tenant + role are looked up by joining `auth.uid()` to
--     the `User` table (which mirrors auth.users.id).
--   • super_admin bypasses tenant scoping (the admin console reads
--     across tenants).
-- ─────────────────────────────────────────────────────────────────────

-- Helper: current user's tenant
create or replace function public.current_tenant_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "tenantId" from "User" where id = auth.uid()::text limit 1;
$$;

-- Helper: current user's role
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from "User" where id = auth.uid()::text limit 1;
$$;

-- Helper: is super-admin?
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role::text = 'super_admin' from "User" where id = auth.uid()::text limit 1),
    false
  );
$$;

-- ─── Tenant ──────────────────────────────────────────────────────────
alter table "Tenant" enable row level security;

drop policy if exists tenant_select on "Tenant";
create policy tenant_select on "Tenant" for select
  using (public.is_super_admin() or id = public.current_tenant_id());

drop policy if exists tenant_modify on "Tenant";
create policy tenant_modify on "Tenant" for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ─── User ────────────────────────────────────────────────────────────
alter table "User" enable row level security;

drop policy if exists user_select on "User";
create policy user_select on "User" for select
  using (
    public.is_super_admin()
    or "tenantId" = public.current_tenant_id()
    or id = auth.uid()::text
  );

drop policy if exists user_admin_modify on "User";
create policy user_admin_modify on "User" for all
  using (
    public.is_super_admin()
    or (public.current_user_role() = 'tenant_admin' and "tenantId" = public.current_tenant_id())
  )
  with check (
    public.is_super_admin()
    or (public.current_user_role() = 'tenant_admin' and "tenantId" = public.current_tenant_id())
  );

-- ─── Per-tenant data tables (uniform pattern) ────────────────────────
do $$
declare
  t text;
  tables text[] := array[
    'Organization',
    'Assessment',
    'Incident',
    'Ticket',
    'Task',
    'Stakeholder',
    'KeySystem',
    'Vendor',
    'Policy',
    'Tabletop',
    'ForensicLog',
    'Lesson',
    'IncidentNotification'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists %s_tenant_isolation on %I;', lower(t), t);
    execute format($pol$
      create policy %s_tenant_isolation on %I
      for all
      using (public.is_super_admin() or "tenantId" = public.current_tenant_id())
      with check (public.is_super_admin() or "tenantId" = public.current_tenant_id());
    $pol$, lower(t), t);
  end loop;
end$$;

-- ─── Threat intel (global, read-only for tenants) ────────────────────
alter table "ThreatIntel" enable row level security;

drop policy if exists threatintel_read on "ThreatIntel";
create policy threatintel_read on "ThreatIntel" for select using (true);

drop policy if exists threatintel_write on "ThreatIntel";
create policy threatintel_write on "ThreatIntel" for all
  using (public.is_super_admin())
  with check (public.is_super_admin());
