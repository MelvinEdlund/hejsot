# hejsöt

> En vackert designad, modern inbjudningsupplevelse — med personlighet.

A premium-feeling, dark-first invite experience. Make a personal date invite,
share a single link, and let the moment do the work.

---

## Stack

| Lager           | Teknik                                                                |
| --------------- | --------------------------------------------------------------------- |
| App             | **Next.js 14 (App Router)** · TypeScript · React 18 · Server Actions  |
| Stil            | Tailwind CSS · CSS-variabler · Fraunces (display) + Inter (UI)        |
| Animation       | Framer Motion                                                         |
| Databas         | **Supabase Postgres** (service-role client, RLS lockad som standard)  |
| Auth            | Signed JWT i httpOnly-cookie (`jose`)                                 |
| E-post          | Resend (loggar i konsolen om nyckel saknas)                           |
| Validering      | Zod, samma schema på server + klient                                  |
| Rate limiting   | In-memory som default, **Upstash Redis** för produktion (valfritt)    |
| Hosting         | Vercel (edge-aware, säkerhetsheaders i `next.config.mjs`)             |

Inga separata backend-projekt — allt kör i ett enda repo, en deploy.

---

## Mappstruktur

```
hejsot/
├── middleware.ts                  # skyddar /studio/* på edge
├── next.config.mjs                # security headers, image domains
├── tailwind.config.ts             # design tokens via CSS-variabler
├── public/favicon.svg
├── supabase/
│   ├── schema.sql                 # canonical schema (fresh installs)
│   ├── migration_v1_to_v2.sql     # additiv migration från MVP
│   ├── migration_v2_to_v3.sql     # lägger till playful_no + date_options
│   └── migration_v3_to_v4.sql     # sticker_pack, photo_caption, secret_note
└── src/
    ├── app/
    │   ├── layout.tsx             # root layout, fonts, theme, grain
    │   ├── globals.css            # design tokens + base styles
    │   ├── page.tsx               # landing
    │   ├── skapa/page.tsx         # publikt skapa-flöde (inget login)
    │   ├── not-found.tsx
    │   ├── i/[slug]/page.tsx      # invite-sida (server) + OG metadata
    │   ├── api/og/route.tsx       # dynamisk OG-bild per inbjudan
    │   └── studio/                # gömd admin (skyddas av middleware)
    │       ├── layout.tsx
    │       ├── page.tsx           # dashboard + analytics
    │       ├── login/page.tsx
    │       ├── new/page.tsx       # admin: skapa med live preview
    │       └── invite/[id]/page.tsx
    ├── actions/
    │   ├── auth.ts                # login / logout
    │   ├── invitations.ts         # create / archive / delete / resend (admin)
    │   └── respond.ts             # publika svar + view-räknare
    ├── components/
    │   ├── theme-provider.tsx
    │   ├── ui/                    # Button, Field, Logo, ThemeToggle, …
    │   ├── marketing/             # SiteHeader, SiteFooter, DemoInvite
    │   ├── invite/                # InviteExperience (sealed → done)
    │   └── studio/                # StudioHeader, InviteTable, CreateInviteForm
    └── lib/
        ├── env.ts                 # zod-validerade env-variabler
        ├── theme.ts               # delad mellan server-layout + provider
        ├── templates.ts           # 6 stämningar (palett, ton, ikon, copy)
        ├── validation.ts          # Zod-scheman (auktoritativa)
        ├── slug.ts                # namn-baserad slug + slumpad suffix
        ├── queries.ts             # ALL DB-åtkomst (server-only)
        ├── rate-limit.ts          # in-memory / Upstash
        ├── utils.ts               # cn, datum, IP, escape
        ├── types.ts               # domäntyper + mappers
        ├── auth/
        │   ├── jwt.ts             # ren jose — edge-säker
        │   ├── session.ts         # cookie-helpers (server)
        │   └── password.ts        # konstant-tids credential-jämförelse
        ├── email/resend.ts
        └── supabase/{server,client}.ts
```

---

## Kom igång lokalt

### 0. Förkrav
- Node 18+
- Ett Supabase-projekt

### 1. Databas
Öppna Supabase → **SQL Editor** → New query:

- **Helt nytt projekt?** Klistra in `supabase/schema.sql` och kör.
- **Du har redan v1-tabellerna med data?** Klistra in `supabase/migration_v1_to_v2.sql` först.
- **Du är på v2 och vill ha de nya fälten (`playful_no` + `date_options`)?** Kör `supabase/migration_v2_to_v3.sql`. Additiv.
- **Du är på v3 och vill ha polaroid + stickers + hemlig rad?** Kör `supabase/migration_v3_to_v4.sql`. Additiv.

### 2. Miljövariabler
```bash
cd hejsot
cp .env.example .env.local
```
Fyll i `.env.local`:

| Variabel                          | Vad                                                     |
| --------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | `http://localhost:3000` lokalt, prod-URL i Vercel       |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase → Settings → API → Project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase → Settings → API → anon                         |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase → Settings → API → **service_role** (server-only) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`  | Det enda kontot som kan logga in                         |
| `AUTH_SECRET`                     | Slumpad sträng, ≥ 32 tecken (`openssl rand -base64 48`)  |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Valfritt — lämnas tomt loggar mailen istället        |
| `UPSTASH_REDIS_REST_URL/TOKEN`    | Valfritt — distribuerad rate limiting i produktion       |

### 3. Kör
```bash
npm install
npm run dev
```
- Landningssida: <http://localhost:3000>
- Admin (gömd): <http://localhost:3000/studio> (redirigerar till login)

---

## Arkitekturen i korthet

**Allt data går via servern.** Webbläsaren får aldrig service-role-nyckeln. Supabase RLS är på, inga publika policys — gör att även om någon hittar adressen till tabellerna med anon-nyckeln, så är det stängt. All läsning/skrivning sker via `src/lib/queries.ts` (markerad `server-only`).

**Server actions istället för REST-API.** Skapa, svara, logga in, arkivera — allt är Zod-validerade server actions. Klienten anropar dem direkt utan att vi behöver bygga och versionera ett HTTP-API. När SaaS-rollout sker kan vi exponera publika REST-routes via `app/api/*/route.ts` utan att röra resten.

**Auth utan komplexitet.** En enda admin (`ADMIN_EMAIL` + `ADMIN_PASSWORD`). Vid login signeras en JWT med `AUTH_SECRET` och läggs i en `httpOnly`, `Secure`, `SameSite=Lax`-cookie. `middleware.ts` verifierar den på edge för alla `/studio/*` utom `/studio/login` och redirigerar annars.

**Templates är personlighetslagret.** Varje template (`coffee`, `drinks`, `walk`, `dinner`, `spontaneous`, `custom`) är en post i `src/lib/templates.ts` med palett, ikon, mood-ord och standardcopy. Hela invite-upplevelsen tintar sin bakgrund och CTA-gradient från template-färgerna — samma designkomponenter, sex sinnesstämningar.

**Mörkt/ljust läge utan FOUC.** Färger lever som RGB-kanaler i CSS-variabler. Ett inline-script i `<head>` sätter `.light`-klassen på `<html>` innan paint baserat på `localStorage`. `ThemeProvider` håller React-staten i sync.

**Skalbar för framtida SaaS.** Databasen har redan `owner_id uuid` (nullable) på `invitations` — när vi kopplar på Supabase Auth för publika konton räcker det att börja sätta det fältet. Admin-strukturen flyttas under ett tenant-scope, inget UI behöver byggas om från grunden.

---

## Vercel-deploy (production)

1. **Push till Git** (GitHub/GitLab/Bitbucket).
2. På Vercel: **New Project** → välj repot.
   - **Root Directory**: `hejsot`
   - **Framework**: Next.js (autodetekteras)
   - Lämna build/output på default.
3. **Environment Variables** — lägg in alla från `.env.example`. Glöm inte:
   - `NEXT_PUBLIC_SITE_URL` = din produktionsdomän (t.ex. `https://hejsot.com`).
   - `AUTH_SECRET` = en *annan* slumpad sträng än lokalt.
4. **Domän**: Project → Settings → Domains → lägg till din domän, peka A/CNAME enligt Vercels instruktioner. Sätt sedan `NEXT_PUBLIC_SITE_URL` till den.
5. **Deploy**. Säkerhetsheaders (HSTS, X-Frame-Options, Referrer-Policy, m.fl.) sätts automatiskt av `next.config.mjs`.

### Rate limiting i produktion
Lokalt och på en enda serverless-instans räcker den inbyggda in-memory-limitern. För hela Vercel-skalan, koppla **Upstash Redis** (gratis tier räcker långt):

1. Skapa en Redis-databas på <https://upstash.com>.
2. Kopiera `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` till Vercels env.

Limitern växlar automatiskt — ingen koduppdatering krävs.

---

## E-post (Resend)

Resend sköter både utveckling och produktion utan ändringar:

- **Utan API-nyckel**: `sendResponseNotification` loggar svaret i serverkonsolen istället för att maila. Bra under utveckling.
- **Med API-nyckel**: Sätt `RESEND_API_KEY` + `RESEND_FROM_EMAIL`. I produktion behöver du verifiera din domän hos Resend (Domains → Add Domain → följ DNS-instruktionerna) för att maila från `hej@dindomän.se`. Innan dess kan du använda `onboarding@resend.dev` för tester.

---

## Säkerhet & härdning

- **RLS lockad** — inga publika policys på `invitations` eller `responses`. Service-role enbart server-side.
- **httpOnly Secure cookies** för admin-sessionen, signerade med HMAC SHA-256.
- **Rate limiting** på login (8 / 15 min / IP), skapa (10 / 10 min / IP), svar (20 / 10 min / IP).
- **Honeypot-fält** på svarsformuläret — bots fyller `website`, valida svar lämnar det tomt.
- **Zod-validering** på allt server-side; klientvalidering ger feedback men är inte auktoritativ.
- **Security headers** (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) via `next.config.mjs`.
- **Konstant-tids jämförelse** av admin-credentials.
- **Inga publika sökresultat på invite-länkar**: `robots: { index: false }` på `/i/[slug]`.
- **Edge-säker middleware** — JWT verifieras innan request når någon route under `/studio`.

### Senare härdning (icke-blockerande)
- Byt `ADMIN_PASSWORD` mot en lagrad scrypt/argon2-hash — endast `verifyAdminCredentials` ändras.
- Lägg till CSRF-token-header på server actions med cross-origin riskanalys (Next säkrar samma-origin som standard).
- Koppla Sentry/Logflare för error monitoring — lägg en `instrumentation.ts`-fil med `Sentry.init`.

---

## Roadmap (förberett i koden)

- [x] Templates med per-stämning palett & ton
- [x] Gömd admin + analytics (sedda, svarade, frekvens)
- [x] Mörk/ljus, mobile-first, A24-känsla
- [x] Dynamisk OG-bild för delning
- [ ] Stripe + flera användare → `owner_id` finns redan på invitations
- [ ] AI-genererad copy → server action som streamar via OpenAI/Anthropic
- [ ] Custom domains per användare → Vercel domains API
- [ ] Analytics dashboard per template

---

## Den gamla MVP:n

`/api/` (.NET) och `/web/` (Vite) i rotmappen är den första MVP:n. Den lämnas orörd så länge du vill jämföra. När hejsöt är live kan du radera båda mapparna — den nya appen är fristående i `hejsot/`.

Gjord med kärlek i Sverige.
