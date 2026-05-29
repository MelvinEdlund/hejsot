-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — canonical database schema (v2)
--
--  Use this for a FRESH Supabase project: SQL Editor → New query → paste → Run.
--  (If you're upgrading an existing v1 database with data, run
--   migration_v1_to_v2.sql instead.)
-- ════════════════════════════════════════════════════════════════════════

-- ── invitations ─────────────────────────────────────────────────────────────
create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,

  recipient_name  text not null,
  sender_name     text,

  template        text not null default 'custom',
  headline        text not null,
  message         text not null default '',
  hero_image_url  text,                                   -- optional photo

  ask_timing      boolean not null default true,
  playful_no      boolean not null default false,        -- the bouncy "nej" easter egg
  date_options    text[]  not null default '{}',         -- 0–5 admin-defined dates
  sticker_pack    text    not null default 'mixed',      -- which doodles float around
  photo_caption   text,                                   -- handwritten line under photo
  secret_note     text,                                   -- rom-com line behind a tap
  status          text not null default 'active'
                  check (status in ('active', 'archived')),

  notify_email    text,
  expires_at      timestamptz,
  owner_id        uuid,                                   -- reserved for future multi-user

  -- interactive extras (v5): bgTheme, reasons, countdown, musicUrl, yesText, quiz …
  extras          jsonb,

  created_at      timestamptz not null default now(),
  opened_at       timestamptz,
  open_count      integer not null default 0
);

create index if not exists invitations_slug_idx     on public.invitations (slug);
create index if not exists invitations_created_idx   on public.invitations (created_at desc);
create index if not exists invitations_status_idx    on public.invitations (status);
create index if not exists invitations_template_idx  on public.invitations (template);
create index if not exists invitations_owner_idx     on public.invitations (owner_id);

-- ── responses ────────────────────────────────────────────────────────────────
create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  answer_type    text not null check (answer_type in ('yes', 'maybe', 'custom', 'no')),
  answer         text not null,
  chosen_date    text,                                    -- the recipient's preferred timing
  note           text,                                    -- optional greeting
  created_at     timestamptz not null default now()
);

create index if not exists responses_invitation_idx on public.responses (invitation_id);

-- ── Atomic view counter ──────────────────────────────────────────────────────
create or replace function public.increment_open_count(p_slug text)
returns void language sql as $$
  update public.invitations
     set open_count = open_count + 1,
         opened_at  = coalesce(opened_at, now())
   where slug = p_slug;
$$;

-- ── Row Level Security ───────────────────────────────────────────────────────
-- RLS is ON with NO policies for anon/authenticated. All access happens
-- server-side via the service-role key (which bypasses RLS). That means the
-- public anon key can never read or write these tables — secure by default.
alter table public.invitations enable row level security;
alter table public.responses   enable row level security;

-- ── Storage: optional hero images ────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hero-images', 'hero-images', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "hero-images public read" on storage.objects;
create policy "hero-images public read"
  on storage.objects for select using (bucket_id = 'hero-images');

drop policy if exists "hero-images anon upload" on storage.objects;
create policy "hero-images anon upload"
  on storage.objects for insert with check (bucket_id = 'hero-images');
