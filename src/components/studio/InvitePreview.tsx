import { getTemplate } from "@/lib/templates";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import type { TemplateId } from "@/lib/templates";

/**
 * Miniature, non-interactive render of the invite's "open" state. Mirrors the
 * real InviteExperience so the studio preview is faithful.
 */
export function InvitePreview({
  template,
  recipientName,
  headline,
  message,
  senderName,
}: {
  template: TemplateId;
  recipientName: string;
  headline: string;
  message: string;
  senderName?: string;
}) {
  const t = getTemplate(template);
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/10 bg-bg p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${t.from}26, transparent 70%), radial-gradient(50% 50% at 90% 100%, ${t.to}1f, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
          till {recipientName || "…"}
        </div>
        <div className="mt-4 flex items-center gap-2 text-muted">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#0d0c11]"
            style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
          >
            <TemplateIcon name={t.icon} className="h-[14px] w-[14px]" />
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em]">{t.mood}</span>
        </div>
        <div className="mt-4 font-display text-[1.7rem] leading-tight text-fg">
          {headline || t.defaultHeadline}
        </div>
        {(message || t.defaultMessage) && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {message || t.defaultMessage}
          </p>
        )}
        {senderName && (
          <p className="mt-3 font-display text-[15px] italic text-fg/80">— {senderName}</p>
        )}
        <div className="mt-6 flex gap-2.5">
          <div
            className="flex-1 rounded-full py-2.5 text-center text-[14px] font-medium text-[#0d0c11]"
            style={{ background: `linear-gradient(100deg, ${t.from}, ${t.to})` }}
          >
            Ja, gärna
          </div>
          <div className="rounded-full border border-border/15 px-5 py-2.5 text-center text-[14px] text-muted">
            Kanske
          </div>
        </div>
      </div>
    </div>
  );
}
