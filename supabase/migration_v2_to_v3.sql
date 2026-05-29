-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — migration v2 → v3
--
--  Adds:
--    • playful_no    — toggle the runaway "nej" button on the invite page
--    • date_options  — admin-defined date suggestions the recipient can tick
--
--  Run this once in the Supabase SQL editor on an existing v2 database.
-- ════════════════════════════════════════════════════════════════════════

alter table public.invitations
  add column if not exists playful_no   boolean not null default false,
  add column if not exists date_options text[]  not null default '{}';
