alter table public.lead_metadata
  add column if not exists lead_status_history jsonb not null default '[]'::jsonb;

create or replace function public.log_lead_status_change_to_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.lead_status is distinct from new.lead_status
    or old.sold_as is distinct from new.sold_as
  then
    insert into public.lead_metadata (
      lead_id,
      lead_status_history
    )
    values (
      new.lead_id,
      jsonb_build_array(
        jsonb_build_object(
          'changed_at', now(),
          'changed_by_role', nullif(current_setting('request.jwt.claim.role', true), ''),
          'changed_by_sub', nullif(current_setting('request.jwt.claim.sub', true), ''),
          'request_headers', nullif(current_setting('request.headers', true), '')::jsonb,
          'old_lead_status', old.lead_status,
          'new_lead_status', new.lead_status,
          'old_sold_as', old.sold_as,
          'new_sold_as', new.sold_as
        )
      )
    )
    on conflict (lead_id) do update
    set lead_status_history =
      coalesce(public.lead_metadata.lead_status_history, '[]'::jsonb) ||
      jsonb_build_array(
        jsonb_build_object(
          'changed_at', now(),
          'changed_by_role', nullif(current_setting('request.jwt.claim.role', true), ''),
          'changed_by_sub', nullif(current_setting('request.jwt.claim.sub', true), ''),
          'request_headers', nullif(current_setting('request.headers', true), '')::jsonb,
          'old_lead_status', old.lead_status,
          'new_lead_status', new.lead_status,
          'old_sold_as', old.sold_as,
          'new_sold_as', new.sold_as
        )
      );
  end if;

  return new;
end;
$$;

drop trigger if exists leads_status_metadata_history_trigger on public.leads;

create trigger leads_status_metadata_history_trigger
after update of lead_status, sold_as on public.leads
for each row
execute function public.log_lead_status_change_to_metadata();
