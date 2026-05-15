alter table public.leads
  add column if not exists language text,
  add column if not exists source text;

alter table public.leads
  drop constraint if exists leads_language_format;

alter table public.leads
  add constraint leads_language_format
  check (language is null or language in ('en', 'es'));

alter table public.leads
  drop constraint if exists leads_source_format;

alter table public.leads
  add constraint leads_source_format
  check (source is null or source in ('network', 'internal'));
