import { ArrowRight, Camera, Sparkles, Heart, Lock, Mail } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { DemoInvite } from "@/components/marketing/DemoInvite";
import { TemplateShowcase } from "@/components/marketing/TemplateShowcase";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const FEATURES = [
  {
    icon: Camera,
    title: "lägg in en gif",
    body: "ditt ansikte, rolig katt, memes eller vad som helst.",
  },
  {
    icon: Sparkles,
    title: "välj stickers",
    body: "hjärtan, katter, blommor, glitter — sex paket att välja mellan. flyter omkring i bakgrunden.",
  },
  {
    icon: Heart,
    title: "lurig nej-knapp",
    body: "Nej-knapp som springer iväg när man försöker klicka. bara ja finns kvar.",
  },
  {
    icon: Mail,
    title: "svar direkt i din mail",
    body: "vi pingar dig så fort inbjudan har svarats på, utan att du behöver logga in.",
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
              <h1 className="font-display text-[2.6rem] font-medium leading-[1.04] tracking-tightest text-fg sm:text-6xl">
                bygg din egen
                <span className="text-gradient italic"> hemsida</span> till
                dejten.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">
                lägg in bilder, stickers, favoritlåten. skicka en länk som känns
                som att <em className="italic">du</em> faktiskt gjort det själv.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button href="/skapa" size="lg">
                  bygg en hemsida
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
                <Button href="#funktioner" variant="ghost" size="lg">
                  se vad som ingår
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-5 text-[12px] italic text-muted/70">
                inget konto. bara en länk, en fråga och förhoppningsvis en date.
              </p>
            </Reveal>
          </div>

          <div className="md:pl-4">
            <DemoInvite />
          </div>
        </section>

        {/* ── Features ── */}
        <section id="funktioner" className="scroll-mt-24 py-20">
          <Reveal>
            <h2 className="max-w-xl font-display text-3xl font-medium leading-tight text-fg sm:text-4xl">
              Exempel på grejer du kan bygga.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/10 bg-surface/50 p-5 transition-colors hover:border-border/25">
                  <div
                    aria-hidden
                    className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))",
                    }}
                  />
                  <f.icon className="relative h-5 w-5 text-fg" />
                  <div className="relative mt-4 font-display text-lg text-fg">
                    {f.title}
                  </div>
                  <p className="relative mt-1 text-[13px] leading-relaxed text-muted">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Template showcase ── */}
        <section id="exempel" className="scroll-mt-24 py-12">
          <Reveal>
            <h2 className="max-w-xl font-display text-3xl font-medium leading-tight text-fg sm:text-4xl">
              sex olika dejtförslag.{" "}
              <span className="text-muted"> eller skriv din egen.</span>
            </h2>
          </Reveal>
          <div className="mt-10">
            <TemplateShowcase />
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="pb-12 pt-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-4xl font-medium leading-tight text-fg sm:text-5xl">
                redo?
              </h2>
              <p className="mt-3 text-lg text-muted">
                det tar en minut. resten är upp till dejten.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="/skapa" size="lg">
                  bygg en hemsida ♡
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
