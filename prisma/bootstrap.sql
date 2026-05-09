-- ─────────────────────────────────────────────────────────────────────
-- Bootstrap helpers — run AFTER schema migration + RLS policies.
--
-- Use these once, in the Supabase SQL editor, to create your first
-- super-admin user and the demo tenant. Replace the email below.
-- ─────────────────────────────────────────────────────────────────────

-- 1. Create the Dark Rock Labs internal tenant (super-admin home).
insert into "Tenant" (id, name, slug, status, plan, "isDemoTenant", "createdAt", "updatedAt")
values (
  'tenant_darkrock',
  'Dark Rock Labs',
  'darkrock',
  'active',
  'enterprise',
  false,
  now(), now()
)
on conflict (id) do nothing;

-- 2. Create the demo tenant.
insert into "Tenant" (id, name, slug, status, plan, "isDemoTenant", "createdAt", "updatedAt")
values (
  'tenant_demo',
  'Acme Demo Corp',
  'demo',
  'active',
  'demo',
  true,
  now(), now()
)
on conflict (id) do nothing;

-- 3. Promote a Supabase auth user to super_admin.
--    REPLACE the email below before running. The user must already exist
--    in Supabase Auth (sign them up first via the dashboard or the app).
do $$
declare
  v_uid text;
  v_email text := 'alexander.bates@darkrocksecurity.com'; -- ← change me
begin
  select id::text into v_uid from auth.users where email = v_email;
  if v_uid is null then
    raise exception 'No Supabase auth user with email %. Sign up first.', v_email;
  end if;

  insert into "User" (id, email, "fullName", role, "tenantId", active, "createdAt", "updatedAt")
  values (v_uid, v_email, 'Alexander Bates', 'super_admin', 'tenant_darkrock', true, now(), now())
  on conflict (id) do update
    set role = 'super_admin',
        "tenantId" = 'tenant_darkrock',
        active = true,
        "updatedAt" = now();
end$$;
