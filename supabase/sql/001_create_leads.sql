create table public.leads (
  lead_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  funnel_id text not null,
  age_group text,
  insurance_goal text,
  state text,
  zip_code text,
  first_name text,
  last_name text,
  phone_number text,
  email text,
  lead_status text not null default 'pending_call',

  payload jsonb
);

alter table public.leads
  add constraint leads_state_format
  check (state is null or state ~ '^[A-Z]{2}$');

alter table public.leads
  add constraint leads_zip_code_format
  check (zip_code is null or zip_code ~ '^[0-9]{5}$');

alter table public.leads
  add constraint leads_phone_number_format
  check (phone_number is null or phone_number ~ '^[0-9]{10}$');

alter table public.leads
  add constraint leads_email_format
  check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
