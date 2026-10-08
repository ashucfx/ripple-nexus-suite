create table if not exists public.rn_onboarding_jobs (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  idempotency_key text not null unique,
  tenant_id uuid references public.rn_tenants(id) on delete set null,
  requested_by uuid not null references auth.users(id) on delete restrict,
  correlation_id uuid not null default gen_random_uuid(),
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued', 'provisioning', 'ready', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rn_onboarding_jobs_status_idx
  on public.rn_onboarding_jobs (status, next_attempt_at);
create index if not exists rn_onboarding_jobs_correlation_id_idx
  on public.rn_onboarding_jobs (correlation_id);
create index if not exists rn_onboarding_jobs_tenant_id_idx
  on public.rn_onboarding_jobs (tenant_id);

create or replace function public.rn_touch_onboarding_job()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rn_onboarding_jobs_touch on public.rn_onboarding_jobs;
create trigger rn_onboarding_jobs_touch
before update on public.rn_onboarding_jobs
for each row execute function public.rn_touch_onboarding_job();

alter table public.rn_onboarding_jobs enable row level security;

create policy rn_onboarding_jobs_select on public.rn_onboarding_jobs
  for select to authenticated
  using (public.rn_is_internal_operator());

create policy rn_onboarding_jobs_write on public.rn_onboarding_jobs
  for all to authenticated
  using (public.rn_can_write())
  with check (public.rn_can_write());
