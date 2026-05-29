-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — migration v1 → v2 (premium upgrade)
--
--  Run this ONCE in Supabase → SQL Editor if you already have the original
--  MVP tables with data. It is ADDITIVE and backward-compatible: no existing
--  column is dropped, and every existing row is safely backfilled by the
--  new column defaults.
-- ════════════════════════════════════════════════════════════════════════

-- ── invitations: new columns ───────────────────────────────────────────────
alter table public.invitations
  add column if not exists template    text        not null default 'custom',
  add column if not exists status       text        not null default 'active',
  add column if not exists ask_timing   boolean     not null default true,
  add column if not exists expires_at   timestamptz,
  add column if not exists owner_id     uuid;        -- reserved for future multi-user

-- Constrain status to known values (idempotent).
alter table public.invitations drop constraint if exists invitations_status_check;
alter table public.invitations
  add constraint invitations_status_check check (status in ('active', 'archived'));

-- Backfill template from any legacy hint, otherwise leave 'custom'.
update public.invitations set template = 'custom' where template is null;

-- ── responses: new column + widen answer_type ──────────────────────────────
alter table public.responses
  add column if not exists note text;

-- The new flow uses answer_type 'maybe'. Widen the check to allow it while
-- keeping the legacy values valid.
alter table public.responses drop constraint if exists responses_answer_type_check;
alter table public.responses
  add constraint responses_answer_type_check
  check (answer_type in ('yes', 'maybe', 'template', 'custom', 'no'));

-- ── Helpful indexes for the dashboard ───────────────────────────────────────
create index if not exists invitations_status_idx   on public.invitations (status);
create index if not exists invitations_template_idx  on public.invitations (template);
create index if not exists invitations_owner_idx     on public.invitations (owner_id);

-- ── Ensure the atomic view counter exists (no-op if already present) ────────
create or replace function public.increment_open_count(p_slug text)
returns void language sql as $$
  update public.invitations
     set open_count = open_count + 1,
         opened_at  = coalesce(opened_at, now())
   where slug = p_slug;
$$;
