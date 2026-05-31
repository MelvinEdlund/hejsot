import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Användarvillkor – HejSöt",
  robots: { index: true },
};

export default function AnvandarvillkorPage() {
  const UPDATED = "2025-06-01";
  return (
    <LegalLayout title="Användarvillkor">
      <p>Senast uppdaterade: {UPDATED}</p>
      <p>
        Dessa villkor utgör ett bindande avtal mellan dig och HejSöt när du använder tjänsten.
        Läs igenom dem noga. Genom att använda tjänsten accepterar du dessa villkor.
      </p>

      <h2>1. Tjänsten</h2>
      <p>
        HejSöt låter dig skapa personliga digitala dejtinbjudningar och dela dem som unika
        länkar. Tjänsten levereras as-is och riktar sig till användare 18 år och äldre i Sverige
        och EU.
      </p>

      <h2>2. Tillåten användning</h2>
      <p>Du förbinder dig att:</p>
      <ul>
        <li>Endast skapa inbjudningar du har rätt att skicka.</li>
        <li>Inte använda tjänsten för trakasserier, stalkning eller hot.</li>
        <li>Inte skicka inbjudningar till minderåriga (under 18 år).</li>
        <li>Inte ladda upp upphovsrättsskyddad bild utan tillstånd.</li>
        <li>Inte använda automatiserade skript för att skapa inbjudningar i bulk.</li>
      </ul>

      <h2>3. Betalning och ångerrätt</h2>
      <p>
        Priset är <strong>19 kr</strong> per inbjudningslänk. Betalning sker via Stripe.
      </p>
      <p>
        Enligt distansavtalslagen har konsumenter normalt 14 dagars ångerrätt. Eftersom du
        aktivt begär att inbjudningslänken låses upp direkt efter betalning <strong>
        godkänner du att tjänsten påbörjas omedelbart och att ångerrätten därmed förfaller
        </strong> (lag 2005:59, 2 kap. 11 § 2 p.).
      </p>
      <p>
        Vi erbjuder ändå en frivillig nöjd-garanti: kontakta{" "}
        <a href="mailto:hej@hejsot.lol">hej@hejsot.lol</a> inom 48 timmar om du är missnöjd
        och vi bedömer återbetalning case-by-case.
      </p>

      <h2>4. Innehåll och upphovsrätt</h2>
      <p>
        Du behåller äganderätten till det innehåll du skapar. Du ger HejSöt en begränsad,
        icke-exklusiv licens att lagra och visa innehållet i syfte att leverera tjänsten.
      </p>
      <p>
        HejSöt reserverar rätten att ta bort innehåll som bryter mot dessa villkor utan
        förvarning.
      </p>

      <h2>5. Minderåriga</h2>
      <p>
        Tjänsten får inte användas av eller riktas till personer under 18 år. Vi lagrar
        inga uppgifter om minderåriga.
      </p>

      <h2>6. Ansvarsbegränsning</h2>
      <p>
        HejSöt ansvarar inte för hur mottagaren reagerar på en inbjudan. Tjänsten garanterar
        inte ett visst resultat. Ansvar begränsas till det belopp du betalat för tjänsten.
      </p>

      <h2>7. Rapportering av missbruk</h2>
      <p>
        Rapportera olämpligt innehåll till{" "}
        <a href="mailto:hej@hejsot.lol">hej@hejsot.lol</a>. Vi utreder och agerar inom 48 h.
      </p>

      <h2>8. Tillämplig lag och tvist</h2>
      <p>
        Svensk lag tillämpas. Tvist prövas i svensk allmän domstol. Konsumenter kan även vända
        sig till Allmänna reklamationsnämnden (ARN), arn.se.
      </p>

      <h2>9. Kontakt</h2>
      <p>
        <a href="mailto:hej@hejsot.lol">hej@hejsot.lol</a>
      </p>
    </LegalLayout>
  );
}
