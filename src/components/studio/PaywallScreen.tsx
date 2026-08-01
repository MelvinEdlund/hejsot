"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lock,
  Unlock,
  Check,
  ArrowRight,
  Shield,
  Heart,
  Sparkles,
  Timer,
  ArrowDown,
} from "lucide-react";
import { getTemplate } from "@/lib/templates";
import type { TemplateId } from "@/lib/templates";
import type { InviteExtras, StickerPack } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Decorations } from "@/components/invite/Decorations";
import { AnimatedBg } from "@/components/invite/AnimatedBg";
import { Polaroid } from "@/components/invite/Polaroid";
import { GifCard } from "@/components/invite/GifCard";
import { SpotifyPlayer } from "@/components/invite/SpotifyPlayer";
import { RunawayNo } from "@/components/invite/RunawayNo";

// ── Social proof ─────────────────────────────────────────────────
const INVITE_COUNT = "4 127";

// ── Ease ─────────────────────────────────────────────────────────
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Stage-typer ─────────────────────────────────────────────────
type Stage = "hook" | "open" | "gate";

// ── Nedräkning (identisk med InviteExperience) ───────────────────
function useCountdown(isoTarget: string | undefined) {
  const calc = useCallback(() => {
    if (!isoTarget) return null;
    const diff = new Date(isoTarget).getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  }, [isoTarget]);
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!isoTarget) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [isoTarget, calc]);
  return time;
}

// ── Countdown-display (identisk med InviteExperience) ────────────
function CountdownDisplay({
  countdown,
}: {
  countdown: { d: number; h: number; m: number; s: number };
}) {
  return (
    <div>
      <div className="mb-3 font-display text-[13px] italic text-muted">
        vi har…
      </div>
      <div className="flex items-stretch gap-2 sm:gap-3">
        {[
          { v: countdown.d, l: "dagar" },
          { v: countdown.h, l: "timmar" },
          { v: countdown.m, l: "min" },
          { v: countdown.s, l: "sek" },
        ].map(({ v, l }, i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 + i * 0.06, duration: 0.5, ease }}
            className="flex flex-1 flex-col items-center rounded-2xl border border-border/15 bg-surface/50 py-3 backdrop-blur-sm"
          >
            <span className="font-display text-2xl font-medium tabular-nums text-fg sm:text-3xl">
              {String(v).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] text-muted sm:text-[11px]">
              {l}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Ord-för-ord headline ─────────────────────────────────────────
function CinematicHeadline({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tightest text-fg sm:text-[3.25rem]">
        {text}
      </h1>
    );
  }
  return (
    <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tightest text-fg sm:text-[3.25rem]">
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.08, duration: 0.55, ease }}
          className="mr-[0.22em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// ── Progress-prickar ─────────────────────────────────────────────
function ProgressDots({
  total,
  current,
  accentFrom,
  accentTo,
}: {
  total: number;
  current: number;
  accentFrom: string;
  accentTo: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          animate={{
            width: i === current ? 24 : 6,
            opacity: i <= current ? 1 : 0.3,
          }}
          transition={{ duration: 0.35, ease }}
          className="h-1.5 rounded-full"
          style={{
            background:
              i <= current
                ? `linear-gradient(90deg, ${accentFrom}, ${accentTo})`
                : "rgb(var(--color-border) / 0.4)",
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Huvud-komponent
// ══════════════════════════════════════════════════════════════════

interface PaywallScreenProps {
  slug: string;
  recipientName: string;
  senderName?: string;
  template: TemplateId;
  headline: string;
  message: string;
  heroImageUrl?: string | null;
  photoCaption?: string | null;
  stickerPack: StickerPack;
  playfulNo: boolean;
  dateOptions: string[];
  extras?: InviteExtras;
  accentFrom: string;
  accentTo: string;
}

export function PaywallScreen({
  slug,
  recipientName,
  senderName,
  template,
  headline,
  message,
  heroImageUrl,
  photoCaption,
  stickerPack,
  playfulNo,
  dateOptions,
  extras,
  accentFrom,
  accentTo,
}: PaywallScreenProps) {
  const t = getTemplate(template);
  const reduce = useReducedMotion();

  const [stage, setStage] = useState<Stage>("hook");
  const [stageDir, setStageDir] = useState(1);
  const [musicArmed, setMusicArmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angerrattConfirmed, setAngerrattConfirmed] = useState(false);

  const firstName = recipientName.split(" ")[0] ?? recipientName;
  const fromFirst = senderName?.split(" ")[0];
  const yesLabel = extras?.yesText || "ja ♡";

  const countdown = useCountdown(extras?.countdown);

  // GIF-slots (identiska med InviteExperience)
  const gifList =
    extras?.gifs && extras.gifs.length > 0
      ? extras.gifs
      : extras?.gifUrl
        ? [{ url: extras.gifUrl, caption: extras.gifCaption }]
        : [];
  const sealedGif = extras?.gifs ? gifList[0] : undefined;
  const openGif = extras?.gifs ? gifList[1] : gifList[0];

  const stageOrder: Stage[] = ["hook", "open", "gate"];

  function goStage(next: Stage) {
    const cur = stageOrder.indexOf(stage);
    const nxt = stageOrder.indexOf(next);
    setStageDir(nxt >= cur ? 1 : -1);
    setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleUnlock() {
    if (!angerrattConfirmed) {
      setError("Du måste bekräfta att du förstår att ångerrätten förfaller.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, confirmedAt: new Date().toISOString() }),
      });
      const data = (await res.json()) as {
        url?: string;
        redirect_url?: string;
        already_unlocked?: boolean;
        error?: string;
      };
      if (data.already_unlocked && data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Något gick fel. Försök igen.");
    } catch {
      setError("Nätverksfel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  const stageVariants = {
    enter: (d: number) => ({
      opacity: 0,
      y: reduce ? 0 : d > 0 ? 28 : -22,
      filter: reduce ? "blur(0px)" : "blur(4px)",
    }),
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: (d: number) => ({
      opacity: 0,
      y: reduce ? 0 : d > 0 ? -18 : 24,
      filter: reduce ? "blur(0px)" : "blur(2px)",
    }),
  };

  // Bakgrundsgradienter (identiska med InviteExperience)
  const bgStyle = {
    background:
      `radial-gradient(65% 55% at 50% -5%, color-mix(in srgb, ${t.from} 32%, transparent), transparent 70%),` +
      `radial-gradient(55% 45% at 95% 105%, color-mix(in srgb, ${t.to} 26%, transparent), transparent 70%),` +
      `radial-gradient(40% 35% at 5% 95%, color-mix(in srgb, ${t.from} 14%, transparent), transparent 60%)`,
  };

  const currentIdx = stageOrder.indexOf(stage);

  return (
    // Outer shell: relative so Decorations (absolute inset-0) is contained
    <div className="relative -mx-5 overflow-x-hidden">
      {/* ── Cinematisk gradient-bakgrund (fixed = fyller hela viewporten) ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 transition-all duration-1000"
        style={bgStyle}
      />

      {/* ── AnimatedBg-tema om valt ──────────────────────────────── */}
      {extras?.bgTheme && extras.bgTheme !== "none" && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <AnimatedBg theme={extras.bgTheme} seed={slug} />
        </div>
      )}

      {/* ── Flytande stickers ────────────────────────────────────── */}
      <Decorations pack={stickerPack} seed={slug} />

      {/* ── Header: progress + kontexttext ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-col items-center gap-3 px-5 pt-8"
      >
        <div className="flex items-center gap-2 rounded-full border border-border/15 bg-bg/70 px-4 py-1.5 backdrop-blur-sm">
          <Heart
            className="h-3 w-3 fill-current"
            style={{ color: t.accent }}
            strokeWidth={0}
          />
          <span className="font-display text-[12px] italic text-muted">
            {stage === "hook"
              ? "förhandsgranskning — klicka dig igenom"
              : stage === "open"
                ? "förhandsgranskning — klicka dig igenom"
                : "allt klart — lås upp och skicka"}
          </span>
        </div>
        <ProgressDots
          total={3}
          current={currentIdx}
          accentFrom={accentFrom}
          accentTo={accentTo}
        />
      </motion.div>

      {/* ── Stage-innehåll ───────────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={stageDir}>
        {/* ══ HOOK (sealed) ══════════════════════════════════════════ */}
        {stage === "hook" && (
          <motion.div
            key="hook"
            custom={stageDir}
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease }}
            className="flex flex-col items-center px-5 pb-32 pt-10 text-center"
          >
            {/* Mottagarens namn */}
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.18, duration: 0.8, ease }}
              className="mt-2 font-display text-5xl font-medium tracking-tightest text-fg sm:text-6xl"
            >
              {firstName}
            </motion.h1>

            {/* Hero-bild som Polaroid */}
            {heroImageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.85, ease }}
                className="mt-10"
              >
                <Polaroid src={heroImageUrl} caption={photoCaption} tilt={-3} />
              </motion.div>
            )}

            {/* GIF slot 0 (sealed) */}
            {sealedGif && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.38, duration: 0.65, ease }}
                className="mt-8 flex justify-center"
              >
                <GifCard
                  src={sealedGif.url}
                  caption={sealedGif.caption}
                  tilt={3}
                />
              </motion.div>
            )}

            {/* Intro-text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-10 max-w-[280px] text-[14px] leading-relaxed text-muted/70"
            >
              {fromFirst
                ? `${fromFirst.toLowerCase()} har nåt speciellt att fråga…`
                : "nåt speciellt väntar — öppna för att se"}
            </motion.p>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6, ease }}
              onClick={() => {
                setMusicArmed(true);
                goStage("open");
              }}
              whileHover={reduce ? undefined : { y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group mt-10 inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-medium text-[#0d0c11]"
              style={{
                background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                boxShadow: `0 0 32px color-mix(in srgb, ${t.from} 35%, transparent), 0 4px 16px rgb(0 0 0 / 0.2)`,
              }}
            >
              öppna inbjudan
              <ArrowDown className="h-[16px] w-[16px] transition-transform group-hover:translate-y-[3px]" />
            </motion.button>
          </motion.div>
        )}

        {/* ══ OPEN (full invite-upplevelse) ══════════════════════════ */}
        {stage === "open" && (
          <motion.div
            key="open"
            custom={stageDir}
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease }}
            className="px-5 pb-40 pt-8"
          >
            {/* From-header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.5 }}
              className="mb-6 flex items-center gap-1.5 text-fg/70"
            >
              <Heart
                className="h-4 w-4 fill-current"
                strokeWidth={0}
                style={{ color: t.accent }}
              />
              <span className="font-display text-[15px] italic">
                {fromFirst
                  ? `från ${fromFirst.toLowerCase()}`
                  : `till ${firstName.toLowerCase()}`}
              </span>
            </motion.div>

            {/* Polaroid */}
            {heroImageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 14, rotate: 3 }}
                animate={{ opacity: 1, y: 0, rotate: 1 }}
                transition={{ duration: 0.75, ease }}
                className="mb-8"
              >
                <Polaroid src={heroImageUrl} caption={photoCaption} tilt={2} />
              </motion.div>
            )}

            {/* Rubrik ord-för-ord */}
            <CinematicHeadline
              text={headline}
              delay={heroImageUrl ? 0.12 : 0.05}
            />

            {/* Meddelande */}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7, ease }}
                className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-fg/85"
              >
                {message}
              </motion.p>
            )}

            {/* Signatur */}
            {senderName && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="mt-5 font-display text-lg italic text-fg/55"
              >
                — {senderName}
              </motion.p>
            )}

            {/* GIF slot 1 (open) */}
            {openGif && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.6, ease }}
                className="mt-8 flex justify-center"
              >
                <GifCard
                  src={openGif.url}
                  caption={openGif.caption}
                  tilt={-2}
                />
              </motion.div>
            )}

            {/* Skäl att säga ja */}
            {extras?.reasons && extras.reasons.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mt-8"
              >
                <div className="mb-3 font-display text-[13px] italic text-muted">
                  därför du borde säga ja:
                </div>
                <div className="grid gap-2">
                  {extras.reasons.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12, filter: "blur(2px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: 0.58 + i * 0.08,
                        duration: 0.5,
                        ease,
                      }}
                      className="flex items-center gap-3 rounded-2xl border border-accent/15 bg-surface/50 px-4 py-3.5 backdrop-blur-sm"
                    >
                      <span
                        className="shrink-0 text-lg"
                        style={{
                          background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        ♡
                      </span>
                      <span className="text-[15px] text-fg/90">{r}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Nerräkning (live!) */}
            {countdown && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.6, ease }}
                className="mt-8"
              >
                <CountdownDisplay countdown={countdown} />
              </motion.div>
            )}

            {/* Musik-spelare (riktig!) */}
            {extras?.musicUrl && musicArmed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.66, duration: 0.6, ease }}
                className="mt-8"
              >
                <SpotifyPlayer
                  url={extras.musicUrl}
                  label={extras.musicLabel}
                  accentFrom={t.from}
                  accentTo={t.to}
                  autoPlay={false}
                />
              </motion.div>
            )}

            {/* Datum-alternativ */}
            {dateOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8"
              >
                <div className="mb-2 font-display text-[13px] italic text-muted">
                  när passar?
                </div>
                <div className="flex flex-wrap gap-2">
                  {dateOptions.map((d) => (
                    <span
                      key={d}
                      className="rounded-full border border-border/20 px-4 py-2 text-[13px] text-muted"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.78, duration: 0.7, ease }}
              className="mt-10 h-px origin-left rounded-full"
              style={{
                background: `linear-gradient(90deg, ${t.from}40, ${t.to}20, transparent)`,
              }}
            />

            {/* ── Blurrade ja/nej-knappar med lås-overlay ─────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="relative mt-8"
            >
              {/* Ghost-knappar (identiska med riktiga, men blurrade) */}
              <div
                className="pointer-events-none select-none"
                style={{ filter: "blur(6px)", opacity: 0.5 }}
              >
                <div
                  className="w-full rounded-full py-4 text-center text-[17px] font-medium text-[#0d0c11]"
                  style={{
                    background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                    boxShadow: `0 0 28px color-mix(in srgb, ${t.from} 30%, transparent)`,
                  }}
                >
                  {yesLabel}
                </div>
                <div className="relative mt-4 flex justify-center">
                  {playfulNo ? (
                    <div className="rounded-full border border-border/20 bg-surface/40 px-5 py-2.5 text-[13px] text-muted">
                      nej
                    </div>
                  ) : (
                    <div className="rounded-full border border-border/20 bg-surface/40 px-5 py-2.5 text-[13px] text-muted">
                      nej tack
                    </div>
                  )}
                </div>
              </div>

              {/* Lås-overlay centrerat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.5, ease }}
                  className="flex items-center gap-2 rounded-full border border-border/20 bg-bg/85 px-5 py-2.5 shadow-lg backdrop-blur-md"
                >
                  <Lock className="h-3.5 w-3.5 text-muted/70" />
                  <span className="text-[13px] text-muted">
                    lås upp och få en egen, privat sida att dela med {firstName}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ══ GATE ════════════════════════════════════════════════════ */}
        {stage === "gate" && (
          <motion.div
            key="gate"
            custom={stageDir}
            variants={stageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease }}
            className="px-5 pb-32 pt-8"
          >
            {/* Premium header */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mb-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                  boxShadow: `0 0 40px color-mix(in srgb, ${accentFrom} 42%, transparent)`,
                }}
              >
                <Sparkles className="h-6 w-6 text-[#0d0c11]" />
              </motion.div>

              <h2 className="font-display text-3xl font-medium text-fg">
                din inbjudan är redo.
              </h2>
              <p className="mt-1.5 text-[15px] text-muted">
                ett steg kvar för att skicka den till {firstName}
              </p>
            </motion.div>

            {/* URL-mockup */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55, ease }}
              className="mb-6 overflow-hidden rounded-2xl border border-border/15 bg-surface/50 backdrop-blur-sm"
            >
              <div
                className="h-0.5 w-full"
                style={{
                  background: `linear-gradient(90deg, ${accentFrom}, ${accentTo}, transparent)`,
                }}
              />
              <div className="flex items-center gap-3 px-5 py-4">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${accentFrom}30, ${accentTo}30)`,
                  }}
                >
                  <Heart
                    className="h-3.5 w-3.5 fill-current"
                    strokeWidth={0}
                    style={{ color: accentFrom }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-muted/60">
                    din unika länk
                  </div>
                  <div
                    className="truncate select-none text-[13px] font-medium text-fg/80"
                    style={{ filter: "blur(3.5px)" }}
                  >
                    hejsot.lol/i/{slug}
                  </div>
                </div>
                <Lock className="h-3.5 w-3.5 shrink-0 text-muted/40" />
              </div>
            </motion.div>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-5 space-y-2.5"
            >
              {[
                `${firstName} får en personlig sida som känns handgjord`,
                "länken fungerar direkt — inga appar, inga konton",
                `du får ett mail när ${firstName} svarar`,
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28 + i * 0.07, duration: 0.45, ease }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${accentFrom}35, ${accentTo}35)`,
                    }}
                  >
                    <Check
                      className="h-3 w-3"
                      style={{ color: accentTo }}
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-[14px] text-fg/85">{text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Ångerrättsbekräftelse */}
            <motion.label
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border/15 bg-surface/40 p-3.5 transition-colors hover:border-border/30"
            >
              <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={angerrattConfirmed}
                  onChange={(e) => setAngerrattConfirmed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="h-5 w-5 rounded-md border-2 transition-all"
                  style={{
                    borderColor: angerrattConfirmed
                      ? accentTo
                      : "rgb(var(--color-border) / 0.4)",
                    background: angerrattConfirmed
                      ? `linear-gradient(135deg, ${accentFrom}, ${accentTo})`
                      : "transparent",
                  }}
                >
                  {angerrattConfirmed && (
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="h-full w-full p-0.5"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="#0d0c11"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-muted/80">
                Jag förstår att tjänsten påbörjas omedelbart efter betalning och
                att{" "}
                <strong className="font-medium text-fg/90">
                  ångerrätten därmed förfaller
                </strong>{" "}
                i enlighet med Distansavtalslagen (2 kap. 11 §).{" "}
                <a
                  href="/anvandarvillkor"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-fg"
                  onClick={(e) => e.stopPropagation()}
                >
                  Läs villkoren
                </a>
                .
              </p>
            </motion.label>

            {/* Betala-knapp */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.55, ease }}
              onClick={handleUnlock}
              disabled={loading || !angerrattConfirmed}
              whileHover={
                loading || !angerrattConfirmed
                  ? undefined
                  : { y: -2, scale: 1.01 }
              }
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group relative w-full overflow-hidden rounded-2xl py-4 text-[16px] font-semibold text-[#0d0c11] transition-all",
                "disabled:pointer-events-none disabled:opacity-60",
              )}
              style={{
                background: `linear-gradient(100deg, ${accentFrom}, ${accentTo})`,
                boxShadow: angerrattConfirmed
                  ? `0 8px 32px color-mix(in srgb, ${accentFrom} 38%, transparent)`
                  : "none",
              }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                      />
                    </svg>
                    skickar dig till betalning…
                  </motion.span>
                ) : (
                  <motion.span
                    key="cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Unlock className="h-4 w-4" />
                    skicka till {firstName}
                    <span className="ml-1 rounded-full bg-black/15 px-2.5 py-0.5 text-[13px] font-medium">
                      19 kr
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-center text-[13px] text-red-400"
              >
                {error}
              </motion.p>
            )}

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1.5 text-[12px] text-muted/60">
                  <Shield className="h-3 w-3" /> Säker betalning via Stripe
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-muted/60">
                  <Sparkles className="h-3 w-3" /> Nöjd-garanti
                </span>
              </div>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted/45">
                efter betalning får du länken direkt. vi lagrar inga
                kortuppgifter.
              </p>
            </motion.div>

            {/* Tillbaka */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => goStage("open")}
              className="mx-auto mt-5 block text-[13px] text-muted/50 transition-colors hover:text-fg"
            >
              ← se inbjudan igen
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ STICKY BOTTOM BAR (visas i open-stage) ═══════════════════ */}
      {stage === "open" && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ delay: 1.1, duration: 0.55, ease }}
          className="fixed inset-x-0 bottom-0 z-40 px-5 pb-safe-4 pb-6 pt-3"
          style={{
            background: `linear-gradient(to top, color-mix(in srgb, rgb(var(--bg, 13 12 17)) 95%, transparent) 70%, transparent)`,
          }}
        >
          <div className="mx-auto max-w-prose">
            <button
              onClick={() => goStage("gate")}
              className="group w-full rounded-2xl py-4 text-[15px] font-semibold text-[#0d0c11] transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(100deg, ${accentFrom}, ${accentTo})`,
                boxShadow: `0 8px 32px color-mix(in srgb, ${accentFrom} 35%, transparent)`,
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Unlock className="h-4 w-4" />
                lås upp och skicka till {firstName}
                <span className="ml-1 rounded-full bg-black/15 px-2.5 py-0.5 text-[13px] font-medium">
                  19 kr
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
