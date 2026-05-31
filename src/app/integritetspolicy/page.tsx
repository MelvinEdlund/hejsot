import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Integritetspolicy – HejSöt",
  robots: { index: true },
};

export default function IntegritetspolicyPage() {
  const UPDATED = "2025-06-01";
  return (
    <LegalLayout title="Integritetspolicy">
      <p>Senast uppdaterad: {UPDATED}</p>
      <p>
        HejSöt (nedan <strong>"vi"</strong>, <strong>"oss"</strong>) värnar om din integritet. Den
        här policyn förklarar vilka personuppgifter vi samlar in, varför vi gör det och vilka
        rättigheter du har enligt GDPR.
      </p>

      <h2>1. Personuppgiftsansvarig</h2>
      <p>
        Personuppgiftsansvarig är HejSöt, kontaktbar via{" "}
        <a href="mailto:hej@hejsot.lol">hej@hejsot.lol</a>.
      </p>

      <h2>2. Uppgifter vi samlar in</h2>
      <h3>2.1 Uppgifter du lämnar aktivt</h3>
      <ul>
        <li>
          <strong>Skaparen av inbjudan:</strong> för- och efternamn (frivilligt), e-postadress
          för notiser, betalningstransaktionernas metadata.
        </li>
        <li>
          <strong>Innehållet i inbjudan:</strong> mottagarens förnamn, din personliga text,
          eventuellt foto (lagrat i krypterat molnlager hos Supabase Storage).
        </li>
        <li>
          <strong>Mottagarens svar:</strong> val (ja / kanske / nej), kommentar, valt datum.
        </li>
      </ul>
      <h3>2.2 Uppgifter som samlas in automatiskt</h3>
      <ul>
        <li>IP-adress (för att förhindra missbruk via rate limiting, lagras max 24 h i minnet).</li>
        <li>Tidpunkt för öppning av inbjudningslänk.</li>
        <li>Teknisk metadata (user-agent, HTTP-headers).</li>
      </ul>

      <h2>3. Rättslig grund</h2>
      <ul>
        <li>
          <strong>Avtal</strong> (GDPR art. 6.1 b): behandling som krävs för att leverera
          tjänsten du köpt.
        </li>
        <li>
          <strong>Berättigat intresse</strong> (GDPR art. 6.1 f): säkerhetskontroller,
          rate limiting, missbruksförebyggande.
        </li>
        <li>
          <strong>Rättslig förpliktelse</strong> (GDPR art. 6.1 c): skattelagstiftning,
          bokföringslagen (7 år).
        </li>
      </ul>

      <h2>4. Lagringstider</h2>
      <ul>
        <li>Inbjudningslänkar raderas automatiskt 7 dagar efter skapande.</li>
        <li>Betalningsuppgifter lagras i 7 år per bokföringslagen.</li>
        <li>Foton raderas när inbjudan raderas.</li>
      </ul>

      <h2>5. Tredjepartsleverantörer</h2>
      <p>Vi delar uppgifter med följande leverantörer under dataskyddsavtal (DPA):</p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> (databas &amp; lagring) – USA, Standard Contractual
          Clauses tillämpas.
        </li>
        <li>
          <strong>Stripe Inc.</strong> (betalningar) – USA/EU, SCC tillämpas. Stripe är
          PCI DSS-certifierat.
        </li>
        <li>
          <strong>Resend Inc.</strong> (e-post) – USA, SCC tillämpas.
        </li>
        <li>
          <strong>Vercel Inc.</strong> (hosting) – USA/EU, SCC tillämpas.
        </li>
      </ul>
      <p>Vi säljer aldrig dina uppgifter till tredje part.</p>

      <h2>6. Dina rättigheter</h2>
      <p>Enligt GDPR har du rätt att:</p>
      <ul>
        <li>begära tillgång till dina uppgifter (registerutdrag),</li>
        <li>begära rättelse eller radering,</li>
        <li>invända mot behandling,</li>
        <li>begära begränsning av behandling,</li>
        <li>dataportabilitet,</li>
        <li>klaga till Integritetsskyddsmyndigheten (IMY), imy.se.</li>
      </ul>
      <p>
        Kontakta oss på <a href="mailto:hej@hejsot.lol">hej@hejsot.lol</a> för att utöva dina
        rättigheter. Vi svarar inom 30 dagar.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Vi använder ett sessionscookie för inloggade skapare. Inga tredjepartscookies används för
        annonsering. Se vår{" "}
        <a href="/cookies">cookiepolicy</a> för detaljer.
      </p>

      <h2>8. Ändringar</h2>
      <p>
        Väsentliga ändringar kommuniceras via e-post (om vi har din adress) eller via ett
        meddelande på webbplatsen 30 dagar i förväg.
      </p>
    </LegalLayout>
  );
}
