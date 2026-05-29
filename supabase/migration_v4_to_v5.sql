-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — migration v4 → v5
--  Adds the `extras` JSONB column that stores all new interactive features:
--  animated background, reasons, countdown, music vibe, yes-button text,
--  and the mini-quiz.
--
--  Run in Supabase → SQL Editor → New query → paste → Run.
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS extras JSONB DEFAULT NULL;

COMMENT ON COLUMN public.invitations.extras IS
  'Optional interactive extras: bgTheme, reasons[], countdown, musicUrl, musicLabel, yesText, quiz[]';
