-- ─────────────────────────────────────────────────────────────────
--  HejSöt · Paywall migration
--  Run this in Supabase SQL editor (or psql) before deploying.
-- ─────────────────────────────────────────────────────────────────

-- 1. Track payment state on the invitation itself
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS is_unlocked       BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT      DEFAULT NULL;

-- 2. Index so the webhook lookup (by session id) is fast
CREATE INDEX IF NOT EXISTS idx_invitations_stripe_session_id
  ON invitations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- 3. Back-fill: any invite that already has a response is considered
--    unlocked (so existing paid invites keep working after deploy).
UPDATE invitations i
SET is_unlocked = TRUE
WHERE EXISTS (
  SELECT 1 FROM responses r WHERE r.invitation_id = i.id
);

-- 4. Optional: also unlock invites created before paywall launched
--    (remove or comment out if you want to force everyone to pay)
-- UPDATE invitations SET is_unlocked = TRUE WHERE created_at < NOW();

-- ── Ångerrättsbekräftelse ─────────────────────────────────────────
-- Lagrar exakt när köparen bekräftade att ångerrätten förfaller.
-- Krävs som bevis enligt Distansavtalslagen 2 kap. 11 §.
ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS angerratt_confirmed_at TIMESTAMPTZ DEFAULT NULL;
