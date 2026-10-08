alter table public.invoices
  add column if not exists country_code text,
  add column if not exists payment_method text,
  add column if not exists payment_provider text,
  add column if not exists subtotal numeric,
  add column if not exists discount_rate numeric not null default 0,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists tax_rate numeric not null default 0,
  add column if not exists tax_amount numeric not null default 0,
  add column if not exists processing_fee numeric not null default 0,
  add column if not exists gateway_fee_rate numeric not null default 0,
  add column if not exists gateway_fixed_fee numeric not null default 0,
  add column if not exists provider_payment_id text,
  add column if not exists provider_reference text,
  add column if not exists local_currency_code text,
  add column if not exists local_equivalent_amount numeric,
  add column if not exists settlement_status text not null default 'pending',
  add column if not exists amount_settled numeric,
  add column if not exists settlement_note text,
  add column if not exists settled_at timestamptz;

create index if not exists invoices_payment_provider_idx
  on public.invoices (payment_provider);
create index if not exists invoices_provider_payment_id_idx
  on public.invoices (provider_payment_id);
create index if not exists invoices_settlement_status_idx
  on public.invoices (settlement_status);

create table if not exists public.rn_payment_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.rn_tenants(id) on delete set null,
  invoice_id text not null,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  status text not null default 'received' check (status in ('received', 'processed', 'failed')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

create index if not exists rn_payment_events_invoice_id_idx
  on public.rn_payment_events (invoice_id);
create index if not exists rn_payment_events_tenant_id_idx
  on public.rn_payment_events (tenant_id);

create table if not exists public.rn_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'bank_transfer',
  rail text not null check (rail in ('native', 'swift')),
  currency text not null,
  country text,
  display_name text not null,
  provider_reference text,
  encrypted_instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rn_payment_accounts_routing_idx
  on public.rn_payment_accounts (currency, country, rail, is_active);

alter table public.rn_payment_events enable row level security;
alter table public.rn_payment_accounts enable row level security;

drop policy if exists rn_payment_events_select on public.rn_payment_events;
drop policy if exists rn_payment_events_write on public.rn_payment_events;
create policy rn_payment_events_select on public.rn_payment_events
  for select to authenticated
  using (public.rn_has_tenant_access(tenant_id));
create policy rn_payment_events_write on public.rn_payment_events
  for all to authenticated
  using (public.rn_can_write() and public.rn_has_tenant_access(tenant_id))
  with check (public.rn_can_write() and public.rn_has_tenant_access(tenant_id));

drop policy if exists rn_payment_accounts_select on public.rn_payment_accounts;
drop policy if exists rn_payment_accounts_write on public.rn_payment_accounts;
create policy rn_payment_accounts_select on public.rn_payment_accounts
  for select to authenticated
  using (public.rn_is_internal_operator());
create policy rn_payment_accounts_write on public.rn_payment_accounts
  for all to authenticated
  using (public.rn_can_write())
  with check (public.rn_can_write());
