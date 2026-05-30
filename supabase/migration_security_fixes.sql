-- ════════════════════════════════════════════════════════════════════════
--  hejsöt — säkerhetsfixar (kör i Supabase → SQL Editor → New query)
-- ════════════════════════════════════════════════════════════════════════

-- 1. Aktivera RLS på users-tabellen.
--    Standard-beteendet i Supabase utan RLS är att anon-rollen kan läsa
--    ALL data via REST API:et — inklusive email och password_hash.
--    Med RLS ON och inga policies gäller "deny by default": bara
--    service-role-nyckeln (server-only) kan läsa/skriva tabellen.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Ta bort den öppna anon-upload-policyn på hero-images.
--    Uppladdningar sker nu via /api/upload-url som utfärdar signerade
--    upload-tokens med server-side rate limiting. Direkt anon-åtkomst
--    behövs inte längre.
DROP POLICY IF EXISTS "hero-images anon upload" ON storage.objects;

-- Public read-policy för hero-images behålls (bilderna måste vara publika).
