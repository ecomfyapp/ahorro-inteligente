-- Reference only: expected current public schema after running migrations 001-005.
-- Do not run this whole file if your database already has data.

create table public.leads (
  lead_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  funnel_id text not null,
  age_group text,
  insurance_goal text,
  state text check (state is null or state ~ '^[A-Z]{2}$'),
  zip_code text check (zip_code is null or zip_code ~ '^[0-9]{5}$'),
  first_name text,
  last_name text,
  phone_number text check (phone_number is null or phone_number ~ '^[0-9]{10}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  lead_status text not null default 'ready_for_sell',
  trustedform_cert_url text,
  sold_as text check (sold_as is null or sold_as in ('lead', 'call'))
);

create table public.lead_metadata (
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
