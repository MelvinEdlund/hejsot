import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { DemoInvite } from "@/components/marketing/DemoInvite";
import { TemplateShowcase } from "@/components/marketing/TemplateShowcase";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Välj en känsla",
    body: "Sex stämningar — från ett lugnt kaffe till en middag bara för er två. Eller skriv helt din egen.",
  },
  {
    n: "02",
    title: "Gör den personlig",
    body: "Hennes namn, dina ord. Vi sköter resten: typografin, tajmingen, känslan när den öppnas.",
  },
  {
    n: "03",
    title: "Dela länken",
    body: "En länk, gjord för en enda person. När hon svarar landar det direkt hos dig.",
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      <SiteHeader />

      <main className="mx-auto max-w-content px-5">
        {/* ── Hero ── */}
        <section className="grid items-center gap-12 pb-10 pt-10 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
          <div>
            <Reveal>
              <Kicker>En inbjudan, inte ett sms</Kicker>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-5 font-display text-[2.6rem] font-medium leading-[1.04] tracking-tightest text-fg sm:text-6xl">
                En inbjudan <span className="text-gradient italic">värd att öppna</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">
                Skapa en personlig dejtinbjudan, dela en länk, och låt ögonblicket göra
                jobbet. Inget konto för den du frågar — bara ett ja som känns.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button href="/studio" size="lg">
                  Skapa en inbjudan
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
                <Button href="#hur" variant="ghost" size="lg">
                  Hur det funkar
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-5 text-[13px] text-muted/70">Privat beta · på inbjudan</p>
            </Reveal>
          </div>

          <div className="md:pl-4">
            <DemoInvite />
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="hur" className="scroll-mt-24 py-24">
          <Reveal>
            <Kicker>Så funkar det</Kicker>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-medium leading-tight text-fg sm:text-4xl">
              Tre steg. Mindre än en minut.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border/10 bg-border/10 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08} className="h-full">
                <div className="h-full bg-bg p-7">
                  <div className="font-display text-sm text-accent">{s.n}</div>
                  <h3 className="mt-3 font-display text-xl text-fg">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Template showcase ── */}
        <section className="py-12">
          <Reveal>
            <Kicker>Stämningar</Kicker>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-medium leading-tight text-fg sm:text-4xl">
              En känsla för varje sätt att fråga.
            </h2>
            <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted">
              Samma genomtänkta design, sex olika toner. Varje inbjudan får sin egen färg,
              rytm och röst.
            </p>
          </Reveal>
          <div className="mt-10">
            <TemplateShowcase />
          </div>
        </section>

        {/* ── The moment ── */}
        <section className="py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-border/10 p-10 sm:p-16">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-70"
                style={{
                  background:
                    "radial-gradient(70% 90% at 50% 0%, rgba(178,138,255,0.16), transparent 60%), radial-gradient(50% 70% at 100% 100%, rgba(255,124,161,0.14), transparent 60%)",
                }}
              />
              <div className="mx-auto max-w-prose text-center">
                <h2 className="font-display text-3xl font-medium leading-tight text-fg sm:text-[2.5rem]">
                  Känslan när hon öppnar den.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-muted">
                  Inga skämt på hennes bekostnad. Ingen press. Bara en fråga, vackert ställd —
                  och plats att svara precis som hon vill.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Closing CTA ── */}
        <section className="pb-12 pt-4">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-medium leading-tight text-fg sm:text-5xl">
                Redo att fråga?
              </h2>
              <p className="mt-4 text-lg text-muted">Det tar en minut. Resten minns ni längre.</p>
              <div className="mt-8 flex justify-center">
                <Button href="/studio" size="lg">
                  Skapa en inbjudan
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
