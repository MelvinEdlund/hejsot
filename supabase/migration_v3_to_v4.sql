-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — migration v3 → v4
--
--  Polaroid + stickers update.
--
--  Adds:
--    • sticker_pack   — which doodle-set floats around in the background
--    • photo_caption  — short handwritten line under the hero photo
--    • secret_note    — locked rom-com line revealed after she taps "ja"
--
--  Run this once in the Supabase SQL editor on an existing v3 database.
-- ════════════════════════════════════════════════════════════════════════

alter table public.invitations
  add column if not exists sticker_pack  text not null default 'mixed',
  add column if not exists photo_caption text,
  add column if not exists secret_note   text;
