# https://hejsot.lol/

Make a personal date invite,
share a single link, and make it look like you built the site.

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


---
:))
