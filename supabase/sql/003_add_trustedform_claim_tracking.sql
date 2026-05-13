alter table public.leads
  add column trustedform_claim_status text,
  add column trustedform_claimed_at timestamptz,
  add column trustedform_claim_response jsonb,
  add column trustedform_claim_error text;
