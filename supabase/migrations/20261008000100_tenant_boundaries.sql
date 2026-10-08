create table if not exists public.rn_tenants (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status text not null default 'onboarding' check (status in ('active', 'onboarding', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.rn_memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.rn_tenants(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id),
  check (role in ('client_contractor', 'tenant_operator'))
);

create index if not exists rn_memberships_tenant_id_idx on public.rn_memberships (tenant_id);
create index if not exists rn_memberships_user_id_idx on public.rn_memberships (user_id);

do $$
declare
  table_name text;
  tenant_tables text[] := array['clients', 'briefs', 'deliverables', 'invoices', 'team_members', 'audit_logs', 'system_metrics'];
begin
  foreach table_name in array tenant_tables loop
    execute format('alter table public.%I add column if not exists tenant_id uuid references public.rn_tenants(id)', table_name);
    execute format('create index if not exists %I on public.%I (tenant_id)', table_name || '_tenant_id_idx', table_name);
  end loop;
end
$$;

create table if not exists public.vault_secret_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.rn_tenants(id) on delete restrict,
  secret_name text not null,
  provider_reference text not null,
  environment text not null,
  last_rotated_at timestamptz,
  status text not null default 'active' check (status in ('active', 'rotation_due', 'revoked')),
  created_at timestamptz not null default now(),
  unique (tenant_id, secret_name, environment)
);

create index if not exists vault_secret_references_tenant_id_idx
  on public.vault_secret_references (tenant_id);

create or replace function public.rn_is_internal_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role' in (
      'executive_admin',
      'systems_architect',
      'operations_lead',
      'security_officer',
      'auditor'
    ),
    false
  );
$$;

create or replace function public.rn_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role' in (
      'executive_admin',
      'systems_architect',
      'operations_lead',
      'security_officer'
    ),
    false
  );
$$;

create or replace function public.rn_has_tenant_access(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.rn_is_internal_operator()
    or exists (
      select 1
      from public.rn_memberships membership
      where membership.user_id = auth.uid()
        and membership.tenant_id = target_tenant_id
    );
$$;

alter table public.rn_tenants enable row level security;
alter table public.rn_memberships enable row level security;
alter table public.vault_secret_references enable row level security;

create policy rn_tenants_select on public.rn_tenants
  for select to authenticated
  using (public.rn_is_internal_operator() or public.rn_has_tenant_access(id));

create policy rn_tenants_write on public.rn_tenants
  for all to authenticated
  using (public.rn_can_write())
  with check (public.rn_can_write());

create policy rn_memberships_select on public.rn_memberships
  for select to authenticated
  using (public.rn_is_internal_operator() or user_id = auth.uid());

create policy rn_memberships_write on public.rn_memberships
  for all to authenticated
  using (public.rn_can_write())
  with check (public.rn_can_write());

create policy vault_secret_references_select on public.vault_secret_references
  for select to authenticated
  using (public.rn_has_tenant_access(tenant_id));

create policy vault_secret_references_write on public.vault_secret_references
  for all to authenticated
  using (public.rn_can_write() and public.rn_has_tenant_access(tenant_id))
  with check (public.rn_can_write() and public.rn_has_tenant_access(tenant_id));

do $$
declare
  table_name text;
  tenant_tables text[] := array['clients', 'briefs', 'deliverables', 'invoices', 'team_members', 'audit_logs', 'system_metrics'];
begin
  foreach table_name in array tenant_tables loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists rn_%I_select on public.%I', table_name, table_name);
    execute format('drop policy if exists rn_%I_write on public.%I', table_name, table_name);
    execute format(
      'create policy rn_%I_select on public.%I for select to authenticated using (public.rn_has_tenant_access(tenant_id))',
      table_name,
      table_name
    );
    execute format(
      'create policy rn_%I_write on public.%I for all to authenticated using (public.rn_can_write() and public.rn_has_tenant_access(tenant_id)) with check (public.rn_can_write() and public.rn_has_tenant_access(tenant_id))',
      table_name,
      table_name
    );
  end loop;
end
$$;
