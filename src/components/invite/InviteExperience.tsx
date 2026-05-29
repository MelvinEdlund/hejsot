"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Check, Heart, Sparkles } from "lucide-react";
import type { PublicInvitation, AnswerType } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Spinner } from "@/components/ui/Spinner";
import { Decorations } from "@/components/invite/Decorations";
import { RunawayNo } from "@/components/invite/RunawayNo";
import { Polaroid } from "@/components/invite/Polaroid";
import { Confetti } from "@/components/invite/Confetti";
import { AnimatedBg } from "@/components/invite/AnimatedBg";
import { SpotifyPlayer } from "@/components/invite/SpotifyPlayer";
import { GifCard } from "@/components/invite/GifCard";
import { recordView, submitResponse } from "@/actions/respond";

/**
 * Stage-ordning (v3):
 *   sealed → open → [quiz om det finns] → respond → done
 *
 * Quizen visas EFTER att man läst inbjudan och tryckt ja/nej.
 * Spotify-spelaren är inbäddad inline i storyn (inte flytande).
 */
type Stage = "sealed" | "open" | "quiz" | "respond" | "done";

const TIMING_CHIPS = ["ikväll 🌙", "i helgen ✨", "nästa vecka 📅", "snart ♡"];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeOut: [number, number, number, number] = [0.0, 0.0, 0.18, 1];

// ── Countdown hook ────────────────────────────────────────────────
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

// ── Hjärtburst på "done" ─────────────────────────────────────────
function HeartBurst({
  accentFrom,
  accentTo,
}: {
  accentFrom: string;
  accentTo: string;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 12 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 1.5 + i * 0.1,
            x: Math.cos((i / 12) * Math.PI * 2) * (80 + i * 8),
            y: Math.sin((i / 12) * Math.PI * 2) * (80 + i * 8),
          }}
          transition={{
            duration: 0.9 + i * 0.04,
            ease: easeOut,
            delay: i * 0.03,
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg select-none"
          style={{ color: i % 2 === 0 ? accentFrom : accentTo }}
        >
          ♡
        </motion.span>
      ))}
    </div>
  );
}

// ── Ord-för-ord cinematic rubrik ─────────────────────────────────
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
          className="inline-block mr-[0.22em]"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// ── Nerräkningsdisplay ───────────────────────────────────────────
function CountdownDisplay({
  countdown,
}: {
  countdown: { d: number; h: number; m: number; s: number };
}) {
  return (
    <div>
      <div className="font-display text-[13px] italic text-muted mb-3">
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
            <span
              className="font-display text-2xl font-medium tabular-nums text-fg sm:text-3xl"
              style={{ animation: "countdown-tick 1s ease-in-out infinite" }}
            >
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

// ── Mini quiz ────────────────────────────────────────────────────
function MiniQuiz({
  questions,
  onDone,
  accentFrom,
  accentTo,
  recipientFirstName,
}: {
  questions: NonNullable<PublicInvitation["extras"]>["quiz"];
  onDone: () => void;
  accentFrom: string;
  accentTo: string;
  recipientFirstName: string;
}) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [animOut, setAnimOut] = useState(false);

  const qs = questions ?? [];
  const current = qs[idx];

  function choose() {
    setAnimOut(true);
    setTimeout(() => {
      setAnimOut(false);
      if (idx + 1 >= qs.length) {
        onDone();
      } else {
        setIdx((i) => i + 1);
      }
    }, 400);
  }

  if (!current) return null;

  return (
    <motion.div
      key={`quiz-${idx}`}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={
        animOut ? { opacity: 0, y: reduce ? 0 : -20 } : { opacity: 1, y: 0 }
      }
      transition={{ duration: 0.4, ease }}
      className="w-full max-w-sm"
    >
      <div className="mb-8 flex justify-center gap-2.5">
        {qs.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === idx ? 28 : 6,
              background:
                i <= idx
                  ? `linear-gradient(90deg, ${accentFrom}, ${accentTo})`
                  : "rgb(var(--border)/0.25)",
            }}
          />
        ))}
      </div>

      <div className="font-display text-[11px] uppercase tracking-widest text-muted/70">
        {idx + 1} av {qs.length}
      </div>
      <h2 className="mt-3 font-display text-2xl font-medium leading-snug text-fg sm:text-3xl">
        {current.q}
      </h2>

      <div className="mt-6 grid gap-2.5">
        {current.opts.map((opt, i) => (
          <motion.button
            key={opt}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease }}
            whileHover={
              reduce ? undefined : { x: 5, transition: { duration: 0.15 } }
            }
            whileTap={{ scale: 0.98 }}
            onClick={choose}
            className="group w-full rounded-2xl border border-border/15 bg-surface/50 px-5 py-4 text-left text-[15px] text-fg backdrop-blur-sm transition-all hover:border-accent/40 hover:bg-surface/80 hover:shadow-[0_0_16px_rgba(255,124,161,0.07)]"
          >
            <span
              className="mr-2 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: accentFrom }}
            >
              ❖
            </span>
            {opt}
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-6 text-center text-[12px] italic text-muted/50"
      >
        alla svar är rätt, {recipientFirstName.toLowerCase()} ♡
      </motion.p>
    </motion.div>
  );
}

// ── Huvudupplevelse ───────────────────────────────────────────────
export function InviteExperience({
  invitation,
}: {
  invitation: PublicInvitation;
}) {
  const t = getTemplate(invitation.template);
  const reduce = useReducedMotion();
  const extras = invitation.extras;
  const hasQuiz = (extras?.quiz?.length ?? 0) > 0;

  // Per-slide GIF list — new gifs[] array takes priority over legacy gifUrl
  const gifList =
    extras?.gifs && extras.gifs.length > 0
      ? extras.gifs
      : extras?.gifUrl
        ? [{ url: extras.gifUrl, caption: extras.gifCaption }]
        : [];
  // gifs[0] → sealed slide, gifs[1] → open slide, gifs[2] → respond slide
  const sealedGif = extras?.gifs ? gifList[0] : undefined;
  const openGif = extras?.gifs ? gifList[1] : gifList[0]; // legacy: keep on open
  const respondGif = gifList[2]; // "efter svaret" — visas i respond-steget
  const doneGif = gifList[3]; // "bonusbild"    — visas på done-skärmen

  const [stage, setStage] = useState<Stage>("sealed");
  const [pendingAnswer, setPendingAnswer] = useState<AnswerType>("yes");
  const [answerType, setAnswerType] = useState<AnswerType>("yes");
  const [customText, setCustomText] = useState("");
  const [timing, setTiming] = useState<string>("");
  const [pickedDates, setPickedDates] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [musicArmed, setMusicArmed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const hasDateOptions =
    invitation.dateOptions && invitation.dateOptions.length > 0;
  const firstName =
    invitation.recipientName.split(" ")[0] ?? invitation.recipientName;
  const fromName = invitation.senderName?.split(" ")[0];
  const yesLabel = extras?.yesText || "ja ♡";
  const countdown = useCountdown(extras?.countdown);

  useEffect(() => {
    const id = setTimeout(() => void recordView(invitation.slug), 800);
    return () => clearTimeout(id);
  }, [invitation.slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  const accentStyle = {
    "--from": t.from,
    "--to": t.to,
    "--accent": t.accent,
  } as React.CSSProperties;

  const stageOrder: Stage[] = ["sealed", "open", "quiz", "respond", "done"];
  const [stageDir, setStageDir] = useState(1);

  function goStage(next: Stage) {
    const cur = stageOrder.indexOf(stage);
    const nxt = stageOrder.indexOf(next);
    setStageDir(nxt >= cur ? 1 : -1);
    setStage(next);
  }

  function choose(type: AnswerType) {
    setPendingAnswer(type);
    if (type === "yes") {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2200);
    }
    if (hasQuiz) {
      setStageDir(1);
      setStage("quiz");
    } else {
      setAnswerType(type);
      setStageDir(1);
      setStage("respond");
    }
  }

  function onQuizDone() {
    setAnswerType(pendingAnswer);
    setStageDir(1);
    setStage("respond");
  }

  function toggleDate(d: string) {
    setPickedDates((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  }

  async function send() {
    setError(null);
    const baseAnswer =
      answerType === "yes"
        ? yesLabel
        : answerType === "no"
          ? "Nej"
          : customText.trim();
    if (answerType === "custom" && !baseAnswer) {
      setError("skriv nåt fint först 🥺");
      return;
    }
    const timingValue =
      pickedDates.length > 0 ? pickedDates.join(" · ") : timing || "";
    setSubmitting(true);
    const res = await submitResponse({
      slug: invitation.slug,
      answerType,
      answer: baseAnswer,
      timing: timingValue || undefined,
      note: note.trim() || undefined,
      website,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "något gick snett. försök igen?");
      return;
    }
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 1200);
    goStage("done");
  }

  const stageVariants = {
    enter: (d: number) => ({
      opacity: 0,
      y: d > 0 ? (reduce ? 0 : 22) : reduce ? 0 : -18,
      filter: reduce ? "blur(0px)" : "blur(3px)",
    }),
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: (d: number) => ({
      opacity: 0,
      y: d > 0 ? (reduce ? 0 : -18) : reduce ? 0 : 22,
      filter: reduce ? "blur(0px)" : "blur(2px)",
    }),
  };

  return (
    <div
      ref={mainRef}
      style={accentStyle}
      className="relative flex min-h-dvh flex-col overflow-x-hidden"
    >
      {/* Cinematic gradient bakgrund */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            `radial-gradient(65% 55% at 50% -5%, color-mix(in srgb, var(--from) 32%, transparent), transparent 70%),` +
            `radial-gradient(55% 45% at 95% 105%, color-mix(in srgb, var(--to) 26%, transparent), transparent 70%),` +
            `radial-gradient(40% 35% at 5% 95%, color-mix(in srgb, var(--from) 14%, transparent), transparent 60%)`,
        }}
      />

      {extras?.bgTheme && extras.bgTheme !== "none" && (
        <AnimatedBg theme={extras.bgTheme} seed={invitation.slug} />
      )}
      <Decorations pack={invitation.stickerPack} seed={invitation.slug} />
      <Confetti active={confetti} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative z-10 mx-auto flex w-full max-w-content items-center justify-between px-5 py-5"
      >
        <div className="flex items-center gap-2 text-fg/70">
          <Heart
            className="h-4 w-4 fill-current"
            strokeWidth={0}
            style={{ color: t.accent }}
          />
          <span className="font-display text-[15px] italic">
            {fromName ? `från ${fromName.toLowerCase()}` : "till dig ♡"}
          </span>
        </div>
        <ThemeToggle />
      </motion.header>

      {/* Huvudinnehåll */}
      <main className="relative z-10 mx-auto flex w-full max-w-prose flex-1 flex-col items-center justify-center px-6 pb-24 pt-4">
        <AnimatePresence mode="wait" custom={stageDir}>
          {/* ══ SEALED ═══════════════════════════════════════════════ */}
          {stage === "sealed" && (
            <motion.div
              key="sealed"
              custom={stageDir}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease }}
              className="flex w-full flex-col items-center text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.18, duration: 0.8, ease }}
                className="mt-2 font-display text-5xl font-medium tracking-tightest text-fg sm:text-6xl"
              >
                {firstName}
              </motion.h1>

              {/* Litet handgjort-sticker */}
              <motion.div
                initial={{ opacity: 0, rotate: -6, scale: 0.8 }}
                animate={{ opacity: 1, rotate: -3, scale: 1 }}
                transition={{ delay: 0.32, duration: 0.6, ease }}
                className="mt-3 inline-block rounded-full border border-dashed px-3 py-1 text-[11px] italic text-muted/60"
                style={{ borderColor: `${t.accent}40` }}
              >
                {fromName ? `av ${fromName.toLowerCase()}` : ""}
              </motion.div>

              {invitation.heroImageUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 16, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease }}
                  className="mt-8"
                >
                  <Polaroid
                    src={invitation.heroImageUrl}
                    caption={invitation.photoCaption ?? undefined}
                    tilt={-4}
                  />
                </motion.div>
              )}

              {/* GIF på startsidan (slot 0) */}
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

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: invitation.heroImageUrl ? 0.55 : 0.35,
                  duration: 0.6,
                  ease,
                }}
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
                öppna den här
                <ArrowDown className="h-[16px] w-[16px] transition-transform group-hover:translate-y-[3px]" />
              </motion.button>
            </motion.div>
          )}

          {/* ══ OPEN ══════════════════════════════════════════════════ */}
          {stage === "open" && (
            <motion.div
              key="open"
              custom={stageDir}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.65, ease }}
              className="w-full"
            >
              {/* Polaroid-foto */}
              {invitation.heroImageUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 12, rotate: 1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.7, ease }}
                  className="mb-8"
                >
                  <Polaroid
                    src={invitation.heroImageUrl}
                    caption={invitation.photoCaption ?? undefined}
                    tilt={2}
                  />
                </motion.div>
              )}

              {/* Rubrik — ord för ord */}
              <CinematicHeadline
                text={invitation.headline}
                delay={invitation.heroImageUrl ? 0.12 : 0.05}
              />

              {/* Meddelande */}
              {invitation.message && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.7, ease }}
                  className="mt-6 whitespace-pre-line text-[17px] leading-relaxed text-fg/85"
                >
                  {invitation.message}
                </motion.p>
              )}

              {/* Signatur */}
              {invitation.senderName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="mt-5 font-display text-lg italic text-fg/55"
                >
                  — {invitation.senderName}
                </motion.p>
              )}

              {/* GIF / bild på slide 2 (open) */}
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
                  <div className="font-display text-[13px] italic text-muted mb-3">
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

              {/* Nerräkning */}
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

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.75, duration: 0.7, ease }}
                className="mt-10 h-px origin-left rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${t.from}40, ${t.to}20, transparent)`,
                }}
              />

              {/* Ja / Nej */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.82, duration: 0.7, ease }}
                className="mt-8"
              >
                <motion.button
                  onClick={() => choose("yes")}
                  whileHover={reduce ? undefined : { y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-full py-4 text-center text-[17px] font-medium text-[#0d0c11]"
                  style={{
                    background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                    boxShadow: `0 0 28px color-mix(in srgb, ${t.from} 30%, transparent), 0 4px 16px rgb(0 0 0 / 0.18)`,
                  }}
                >
                  {yesLabel}
                </motion.button>

                <div className="relative mt-4 flex justify-center">
                  {invitation.playfulNo ? (
                    <RunawayNo onPick={() => choose("no")} />
                  ) : (
                    <button
                      onClick={() => choose("no")}
                      className="rounded-full border border-border/15 bg-surface/40 px-5 py-2.5 text-[13px] text-muted backdrop-blur-sm transition-all hover:border-border/30 hover:text-fg"
                    >
                      nej tack
                    </button>
                  )}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.5 }}
                onClick={() => choose("custom")}
                className="mx-auto mt-5 block text-[13px] italic text-muted/55 underline-offset-4 hover:text-fg hover:underline transition-colors"
              >
                eller skriv ett eget svar
              </motion.button>

              {/* Hemlig rad */}
              {invitation.secretNote && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.15, duration: 0.5 }}
                  className="mt-10 flex flex-col items-center"
                >
                  {!secretRevealed ? (
                    <motion.button
                      type="button"
                      onClick={() => setSecretRevealed(true)}
                      whileHover={reduce ? undefined : { scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className="group inline-flex items-center gap-2 rounded-full border border-dashed border-border/25 bg-surface/30 px-5 py-2.5 text-[13px] italic text-muted backdrop-blur-sm transition-all hover:border-border/40 hover:bg-surface/50 hover:text-fg"
                    >
                      <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                      en sista liten grej (tryck)
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="max-w-prose rounded-2xl border border-border/15 bg-surface/50 px-6 py-5 text-center text-[15px] italic leading-relaxed text-fg/85 backdrop-blur-sm shadow-sm"
                    >
                      {invitation.secretNote}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ QUIZ ═════════════════════════════════════════════════ */}
          {stage === "quiz" && extras?.quiz && (
            <motion.div
              key="quiz"
              custom={stageDir}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease }}
              className="flex w-full flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease }}
                className="mb-6 text-center"
              >
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg text-[#0d0c11]"
                  style={{
                    background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                  }}
                >
                  ❖
                </div>
                <p className="font-display text-[13px] italic text-muted">
                  ok men du måste svara på det här först 😇
                </p>
              </motion.div>

              <MiniQuiz
                questions={extras.quiz}
                onDone={onQuizDone}
                accentFrom={t.from}
                accentTo={t.to}
                recipientFirstName={firstName}
              />
            </motion.div>
          )}

          {/* ══ RESPOND ══════════════════════════════════════════════ */}
          {stage === "respond" && (
            <motion.div
              key="respond"
              custom={stageDir}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease }}
              className="w-full"
            >
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="font-display text-3xl font-medium leading-tight text-fg"
              >
                {answerType === "yes"
                  ? "YES omg 🥺"
                  : answerType === "no"
                    ? "okej. respekt. 🥲"
                    : "skriv nåt ♡"}
              </motion.h2>

              {/* GIF slot 3 — "efter svaret" */}
              {respondGif && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.08, duration: 0.55, ease }}
                  className="mt-6 flex justify-center"
                >
                  <GifCard
                    src={respondGif.url}
                    caption={respondGif.caption}
                    tilt={-1}
                  />
                </motion.div>
              )}

              {answerType === "custom" && (
                <motion.textarea
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease }}
                  autoFocus
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={280}
                  placeholder="skriv precis vad du tänker…"
                  className="mt-6 min-h-[120px] w-full resize-y rounded-2xl border border-border/15 bg-surface/60 px-4 py-3.5 text-[15px] leading-relaxed text-fg placeholder:text-muted/55 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 backdrop-blur-sm transition-all"
                />
              )}

              {hasDateOptions && answerType !== "no" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.5, ease }}
                  className="mt-7"
                >
                  <div className="font-display text-[14px] italic text-muted mb-3">
                    när passar dig?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {invitation.dateOptions.map((d) => {
                      const active = pickedDates.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDate(d)}
                          className={
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] transition-all " +
                            (active
                              ? "border-transparent text-[#0d0c11] shadow-sm"
                              : "border-border/20 text-fg hover:border-border/40")
                          }
                          style={
                            active
                              ? {
                                  background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                                }
                              : undefined
                          }
                        >
                          {active && (
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {!hasDateOptions &&
                invitation.askTiming &&
                answerType !== "custom" &&
                answerType !== "no" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.5, ease }}
                    className="mt-7"
                  >
                    <div className="font-display text-[14px] italic text-muted mb-3">
                      när funkar det?
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TIMING_CHIPS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setTiming(timing === c ? "" : c)}
                          className={
                            "rounded-full border px-4 py-2.5 text-[14px] transition-all " +
                            (timing === c
                              ? "border-transparent text-[#0d0c11]"
                              : "border-border/20 text-muted hover:text-fg")
                          }
                          style={
                            timing === c
                              ? {
                                  background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                                }
                              : undefined
                          }
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease }}
                className="mt-7"
              >
                <div className="font-display text-[14px] italic text-muted mb-3">
                  vill du säga nåt? (valfritt)
                </div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                  placeholder="en sak du vill att hen vet…"
                  className="w-full rounded-2xl border border-border/15 bg-surface/60 px-4 py-3.5 text-[15px] text-fg placeholder:text-muted/55 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 backdrop-blur-sm transition-all"
                />
              </motion.div>

              {/* Honeypot */}
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-[14px] text-accent"
                >
                  {error}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5, ease }}
                className="mt-8 flex items-center gap-4"
              >
                <button
                  onClick={send}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium text-[#0d0c11] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                    boxShadow: `0 0 20px color-mix(in srgb, ${t.from} 25%, transparent)`,
                  }}
                >
                  {submitting ? <Spinner /> : null}
                  skicka ♡
                </button>
                <button
                  onClick={() => goStage("open")}
                  className="text-[14px] text-muted transition-colors hover:text-fg"
                >
                  ← tillbaka
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ══ DONE ════════════════════════════════════════════════ */}
          {stage === "done" && (
            <motion.div
              key="done"
              custom={stageDir}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.7, ease }}
              className="relative flex flex-col items-center text-center"
            >
              {heartBurst && <HeartBurst accentFrom={t.from} accentTo={t.to} />}

              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease }}
                className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                  boxShadow: `0 0 48px color-mix(in srgb, ${t.from} 45%, transparent)`,
                }}
              >
                <Heart
                  className="h-9 w-9 fill-current text-[#0d0c11]"
                  strokeWidth={0}
                />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease }}
                className="mt-8 font-display text-4xl font-medium text-fg sm:text-5xl"
              >
                {answerType === "yes"
                  ? "woohoo 🥺"
                  : answerType === "no"
                    ? "okej 🥲"
                    : "skickat ♡"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mx-auto mt-3 max-w-sm text-[16px] text-muted"
              >
                {answerType === "yes"
                  ? "jag hör av mig snart ♡"
                  : "jag hör av mig. promise."}
              </motion.p>

              {/* GIF slot 4 — "bonusbild" på done-skärmen */}
              {doneGif && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.6, ease }}
                  className="mt-8 flex justify-center"
                >
                  <GifCard
                    src={doneGif.url}
                    caption={doneGif.caption}
                    tilt={2}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Persistent music bar — utanför AnimatePresence så den aldrig unmountas ── */}
        {extras?.musicUrl && musicArmed && stage !== "sealed" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease }}
            className="sticky bottom-0 left-0 right-0 z-40 px-4 pb-safe-4 pb-4 pt-2"
            style={{
              background: `linear-gradient(to top, color-mix(in srgb, var(--bg, #0d0c11) 92%, transparent) 70%, transparent)`,
            }}
          >
            <div className="mx-auto max-w-prose">
              <SpotifyPlayer
                url={extras.musicUrl}
                label={extras.musicLabel}
                accentFrom={t.from}
                accentTo={t.to}
              />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
