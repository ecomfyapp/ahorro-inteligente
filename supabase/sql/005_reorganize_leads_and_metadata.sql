create table if not exists public.lead_metadata (
  lead_id uuid primary key references public.leads(lead_id) on delete cascade,
  created_at timestamptz not null default now(),

  source text,
  page text,
  submitted_at timestamptz,
  ip_address text,
  geolocation jsonb,
  device_id text,
  validation jsonb,
  risk_flags text[],
  payload jsonb,

  trustedform_claim_status text,
  trustedform_claimed_at timestamptz,
  trustedform_claim_response jsonb,
  trustedform_claim_error text
);

alter table public.leads
  add column if not exists sold_as text;

alter table public.leads
  alter column sold_as drop default,
  alter column sold_as drop not null;

alter table public.leads
  drop constraint if exists leads_sold_as_format;

alter table public.leads
  add constraint leads_sold_as_format
  check (sold_as is null or sold_as in ('lead', 'call'));

alter table public.leads
  alter column lead_status set default 'ready_for_sell';

insert into public.lead_metadata (
  lead_id,
  source,
  page,
  submitted_at,
  ip_address,
  geolocation,
  device_id,
  validation,
  risk_flags,
  payload,
  trustedform_claim_status,
  trustedform_claimed_at,
  trustedform_claim_response,
  trustedform_claim_error
)
select
  lead_id,
  payload->>'source',
  payload->>'pagina',
  nullif(payload->>'submittedAt', '')::timestamptz,
  payload->>'ipAddress',
  payload->'geolocation',
  payload->'meta'->>'deviceId',
  payload->'validation',
  array(
    select jsonb_array_elements_text(coalesce(payload->'validation'->'flags', '[]'::jsonb))
  ),
  payload,
  trustedform_claim_status,
  trustedform_claimed_at,
  trustedform_claim_response,
  trustedform_claim_error
from public.leads
where payload is not null
on conflict (lead_id) do nothing;

alter table public.leads
  drop column if exists payload,
  drop column if exists trustedform_claim_status,
  drop column if exists trustedform_claimed_at,
  drop column if exists trustedform_claim_response,
  drop column if exists trustedform_claim_error;
