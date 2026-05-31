import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookiepolicy – HejSöt",
  robots: { index: true },
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookiepolicy">
      <p>
        Den här sidan förklarar vilka cookies HejSöt använder och varför.
      </p>

      <h2>Vad är cookies?</h2>
      <p>
        Cookies är små textfiler som lagras i din webbläsare. De hjälper oss att komma ihåg dig
        mellan sidladdningar.
      </p>

      <h2>Cookies vi använder</h2>

      <h3>Nödvändiga cookies (kan inte avaktiveras)</h3>
      <ul>
        <li>
          <strong>hejsot_session</strong> – Adminens inloggningssession. HttpOnly, Secure,
          SameSite=Lax. Raderas när webbläsaren stängs.
        </li>
        <li>
          <strong>hejsot_user</strong> – Inloggad användares session. HttpOnly, Secure,
          SameSite=Lax. 30 dagars livslängd.
        </li>
      </ul>
      <p>
        Dessa är tekniskt nödvändiga för att tjänsten ska fungera. Rättslig grund:
        berättigat intresse (GDPR art. 6.1 f) och tjänsteavtalet (6.1 b).
      </p>

      <h3>Prestandacookies</h3>
      <p>Vi använder inga analyticscookies från tredje part (t.ex. Google Analytics).</p>

      <h3>Marknadsföringscookies</h3>
      <p>Vi använder inga spårningscookies för reklam.</p>

      <h2>Tredjepartscookies</h2>
      <p>
        <strong>Stripe</strong> sätter egna cookies när du genomför en betalning. Dessa
        regleras av{" "}
        <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
          Stripes integritetspolicy
        </a>
        .
      </p>

      <h2>Hur tar du bort cookies?</h2>
      <p>
        I din webbläsares inställningar under Integritet / Cookies kan du se och radera cookies.
        Observera att radering av sessionscookies loggar ut dig från tjänsten.
      </p>

      <h2>Ändringar</h2>
      <p>
        Ändringar i denna policy publiceras på den här sidan. Senast uppdaterad: 2025-06-01.
      </p>
    </LegalLayout>
  );
}
