import { TEMPLATE_LIST } from "@/lib/templates";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Shows the six moods as a quiet grid. Each card carries its own gradient
 * accent so you feel the personality without any clutter.
 */
export function TemplateShowcase() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TEMPLATE_LIST.map((t, i) => (
        <Reveal key={t.id} delay={i * 0.06}>
          <div className="group relative h-full overflow-hidden rounded-2xl border border-border/10 bg-surface/50 p-5 transition-colors hover:border-border/25">
            <div
              aria-hidden
              className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-xl transition-opacity group-hover:opacity-60"
              style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
            />
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#0d0c11]"
              style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
            >
              <TemplateIcon name={t.icon} className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-lg text-fg">{t.label}</div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.tagline}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
