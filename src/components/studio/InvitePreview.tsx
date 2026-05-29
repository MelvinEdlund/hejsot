import { Heart, Music, Timer } from "lucide-react";
import { getTemplate } from "@/lib/templates";
import type { TemplateId } from "@/lib/templates";
import type { InviteExtras, StickerPack } from "@/lib/types";
import { STICKER_PACK_CHOICES } from "@/components/invite/Decorations";

export function InvitePreview({
  template,
  recipientName,
  headline,
  message,
  senderName,
  playfulNo = false,
  dateOptions = [],
  heroImageUrl,
  photoCaption,
  stickerPack = "mixed",
  extras,
}: {
  template: TemplateId;
  recipientName: string;
  headline: string;
  message: string;
  senderName?: string;
  playfulNo?: boolean;
  dateOptions?: string[];
  heroImageUrl?: string | null;
  photoCaption?: string;
  stickerPack?: StickerPack;
  extras?: InviteExtras;
}) {
  const t = getTemplate(template);
  const firstFrom = senderName?.split(" ")[0]?.toLowerCase();
  const pack = STICKER_PACK_CHOICES.find((p) => p.id === stickerPack) ?? STICKER_PACK_CHOICES[0]!;
  const stickerSamples = pack.emojis.slice(0, 5);

  const yesLabel = extras?.yesText || "ja ♡";

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/10 bg-bg p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${t.from}26, transparent 70%), radial-gradient(50% 50% at 90% 100%, ${t.to}1f, transparent 70%)`,
        }}
      />

      {/* Stickers */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {stickerSamples.map((e, i) => (
          <span
            key={i}
            className="absolute opacity-40"
            style={{
              left: `${10 + i * 17}%`,
              top: `${10 + ((i * 31) % 70)}%`,
              fontSize: 16 + (i % 3) * 6,
              transform: `rotate(${(i * 13) % 30 - 15}deg)`,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-1.5 text-fg/70">
          <Heart className="h-3 w-3 fill-current" style={{ color: t.accent }} strokeWidth={0} />
          <span className="font-display text-[12px] italic">
            {firstFrom ? `från ${firstFrom}` : `till ${recipientName?.toLowerCase() || "…"}`}
          </span>
        </div>

        {/* Hero image */}
        {heroImageUrl && (
          <div className="mt-4 flex justify-center">
            <div
              className="relative bg-white p-2 pb-6"
              style={{ transform: "rotate(-2deg)", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImageUrl} alt="" className="h-24 w-24 object-cover sm:h-28 sm:w-28" />
              {photoCaption && (
                <div className="absolute inset-x-0 bottom-1 text-center font-display text-[10px] italic text-black/75">
                  {photoCaption}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Headline + message */}
        <div className="mt-5 font-display text-[1.5rem] leading-tight text-fg">
          {headline || t.defaultHeadline}
        </div>
        {(message || t.defaultMessage) && (
          <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-fg/80">
            {message || t.defaultMessage}
          </p>
        )}
        {senderName && (
          <p className="mt-3 font-display text-[13px] italic text-fg/70">— {senderName}</p>
        )}

        {/* Extras: reasons */}
        {extras?.reasons && extras.reasons.length > 0 && (
          <div className="mt-4">
            <div className="font-display text-[11px] italic text-muted">skäl att säga ja:</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {extras.reasons.map((r, i) => (
                <span
                  key={i}
                  className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[11px] text-fg"
                >
                  ♡ {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Extras: countdown */}
        {extras?.countdown && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/10 bg-surface/50 px-3 py-2">
            <Timer className="h-3.5 w-3.5 text-accent/60" />
            <span className="text-[11px] italic text-muted">
              nerräkning aktiv →{" "}
              {new Date(extras.countdown).toLocaleString("sv-SE", {
                weekday: "short", month: "short", day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Extras: music */}
        {extras?.musicUrl && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/10 bg-surface/50 px-3 py-2">
            <Music className="h-3.5 w-3.5 text-accent/60" />
            <span className="text-[11px] italic text-muted">
              {extras.musicLabel || "musik"} →
            </span>
          </div>
        )}

        {/* Extras: bg theme badge */}
        {extras?.bgTheme && extras.bgTheme !== "none" && (
          <div className="mt-3 rounded-xl border border-border/10 bg-surface/50 px-3 py-1.5">
            <span className="text-[10px] text-muted/70">
              bakgrund: {extras.bgTheme}
            </span>
          </div>
        )}

        {/* Extras: quiz badge */}
        {extras?.quiz && extras.quiz.length > 0 && (
          <div className="mt-3 rounded-xl border border-border/10 bg-surface/50 px-3 py-1.5">
            <span className="text-[10px] text-muted/70">
              mini-quiz: {extras.quiz.length} fråga{extras.quiz.length > 1 ? "r" : ""} innan öppning
            </span>
          </div>
        )}

        {/* Date options */}
        {dateOptions.length > 0 && (
          <div className="mt-5">
            <div className="font-display text-[12px] italic text-muted">när passar?</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dateOptions.slice(0, 4).map((d) => (
                <span key={d} className="rounded-full border border-border/15 px-3 py-1 text-[12px] text-muted">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 space-y-2">
          <div
            className="w-full rounded-full py-2.5 text-center text-[14px] font-medium text-[#0d0c11]"
            style={{ background: `linear-gradient(100deg, ${t.from}, ${t.to})` }}
          >
            {yesLabel}
          </div>
          {playfulNo ? (
            <div className="text-center text-[11px] italic text-muted/70">nej (springer iväg)</div>
          ) : (
            <div className="mx-auto w-fit rounded-full border border-border/15 px-5 py-1.5 text-[13px] text-muted">
              nej
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
