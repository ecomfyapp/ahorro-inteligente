create table if not exists public.ringba_call_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  lead_id uuid references public.leads(lead_id) on delete set null,
  funnel_id text,

  ringba_call_id text,
  event_name text,
  conversion_status text,

  call_duration_seconds integer,
  caller_phone_number text,
  dialed_phone_number text,

  payout numeric,
  revenue numeric,

  raw_payload jsonb not null
);

create index if not exists ringba_call_events_lead_id_idx
  on public.ringba_call_events (lead_id);

create index if not exists ringba_call_events_ringba_call_id_idx
  on public.ringba_call_events (ringba_call_id);

create index if not exists ringba_call_events_created_at_idx
  on public.ringba_call_events (created_at desc);

create or replace function public.expire_pending_call_leads()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.leads
  set lead_status = 'ready_for_sell',
      sold_as = null
  where lead_status = 'pending_call'
    and sold_as is null
    and created_at < now() - interval '5 minutes';

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- Optional cron setup, only run after confirming pg_cron is enabled in Supabase.
-- select cron.schedule(
--   'expire-pending-call-leads',
--   '* * * * *',
--   $$select public.expire_pending_call_leads();$$
-- );
