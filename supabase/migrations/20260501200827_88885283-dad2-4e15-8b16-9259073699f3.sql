ALTER TYPE public.committee_category ADD VALUE IF NOT EXISTS 'lok_sabha_party';
ALTER TYPE public.committee_category ADD VALUE IF NOT EXISTS 't20_board';
ALTER TYPE public.committee_category ADD VALUE IF NOT EXISTS 'cricket_team_or_board';
ALTER TYPE public.committee_category ADD VALUE IF NOT EXISTS 'cricket_league_team';
ALTER TYPE public.committee_category ADD VALUE IF NOT EXISTS 'cricket_league';
-- Prevent duplicate delegate registrations by email (case-insensitive).
-- Acts as the real safeguard against double-submits and accidental dupes.
create unique index if not exists registrations_email_unique_idx
  on public.registrations (lower(trim(email)));

-- Performance index for the admin dashboard ordering by created_at desc.
create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

-- Performance index for public allocations page (committee filter on published rows).
create index if not exists allocations_published_committee_idx
  on public.allocations (committee_id) where published = true;
