-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — e-postverifiering
--  Kör i Supabase → SQL Editor → New query → Run.
-- ════════════════════════════════════════════════════════════════════════

-- Lägg till email_verified-kolumn på users.
-- Befintliga användare markeras direkt som verifierade (skapades manuellt).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Markera alla befintliga användare som verifierade.
UPDATE public.users SET email_verified = TRUE WHERE email_verified = FALSE;
