"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Lock,
  Music,
  Timer,
  Sparkles,
  MessageCircle,
  Gamepad2,
  Palette,
  Heart,
  ChevronRight,
  Clapperboard,
} from "lucide-react";
import { TEMPLATE_LIST, TEMPLATES, type TemplateId } from "@/lib/templates";
import { createInvitation } from "@/actions/invitations";
import { STICKER_PACK_CHOICES } from "@/components/invite/Decorations";
import { BgThemePreview } from "@/components/invite/AnimatedBg";
import type {
  BgTheme,
  InviteExtras,
  QuizQuestion,
  StickerPack,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import { InvitePreview } from "@/components/studio/InvitePreview";
import { PhotoUpload } from "@/components/studio/PhotoUpload";
import { Spinner } from "@/components/ui/Spinner";

type Result = { slug: string; url: string };

const TOTAL_STEPS = 4;

// ── Mall-GIFs (klickbara förslag i formuläret) ─────────────────────
const GIF_TEMPLATES = [
  {
    url: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MzJjY3l5MXh4amphMDg4aTNiNmJla3k3bWN2dGV6MWU4eWE2aW4xdSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KmxmoHUGPDjfQXqGgv/giphy.gif",
    label: "",
  },
  {
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExemdwb3YwOHRjNHVpenFteGJ2ZG5yNXp3cXlsaDF6MjN0Mmp3Ymp1aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/t8xgPfC5oNIRMrNooe/giphy.gif",
    label: "",
  },
  {
    url: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bXJ2MnJtMDdpNmxidm10dTVqN2VhZGNiNnVxOXBhMTRxbDZ0aDZoaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PmLfuW4EZAb5seoiXD/giphy.gif",
    label: "",
  },
  {
    url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2ZlenNxaGdyejRqc2xuN2g5NGxudXJ6a3pxNmZhMzhrazIyMXNxaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dI53rvCkTsyJWFA3Fc/giphy.gif",
    label: "",
  },
  {
    url: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3NDdsY3psb3pjcnd5YmZpMWFzZzk5aTJqa2Y0eGpkZDVpanpsZ3RkNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/I9XrL9Tc1jpe/giphy.gif",
    label: "",
  },
] as const;

const BG_THEMES: BgTheme[] = [
  "none",
  "starfield",
  "bubbles",
  "aurora",
  "roses",
  "heartbeat",
  "snow",
];

const YES_SUGGESTIONS = [
  "ja ♡",
  "självklart ♡",
  "ja tack 🥹",
  "alltid ♡",
  "1000x ja 💌",
  "självfallet ✨",
  "givetvis 🌹",
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Step labels ────────────────────────────────────────────────────
const STEP_META = [
  { label: "stämning", emoji: "✦" },
  { label: "innehåll", emoji: "♡" },
  { label: "extras", emoji: "✨" },
  { label: "detaljer", emoji: "🔒" },
];

// ── Progress indicator ─────────────────────────────────────────────
function StepProgress({
  step,
  accentFrom,
  accentTo,
}: {
  step: number;
  accentFrom: string;
  accentTo: string;
}) {
  return (
    <div className="mb-10">
      {/* Step pills */}
      <div className="flex items-center gap-0">
        {STEP_META.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-all duration-500",
                    done
                      ? "text-[#0d0c11]"
                      : active
                        ? "text-[#0d0c11] shadow-[0_0_16px_rgba(255,124,161,0.4)]"
                        : "bg-surface/60 text-muted/50",
                  )}
                  style={
                    done || active
                      ? {
                          background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
                        }
                      : undefined
                  }
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    s.emoji
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-300",
                    active ? "text-fg" : done ? "text-fg/50" : "text-muted/40",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className="mx-2 mb-4 h-px flex-1 overflow-hidden rounded-full bg-border/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: done ? "100%" : "0%",
                      background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mini section card ──────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/10 bg-surface/40 p-5 transition-colors hover:border-border/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-2/20">
            <Icon className="h-4 w-4 text-fg/70" />
          </span>
          <div>
            <div className="text-[14px] font-medium text-fg">{title}</div>
            {subtitle && (
              <div className="mt-0.5 text-[12px] text-muted">{subtitle}</div>
            )}
          </div>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// ── Chip input (reusable) ──────────────────────────────────────────
function ChipInput({
  values,
  onAdd,
  onRemove,
  draft,
  onDraftChange,
  placeholder,
  max,
  accentColor,
}: {
  values: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  draft: string;
  onDraftChange: (v: string) => void;
  placeholder: string;
  max: number;
  accentColor?: string;
}) {
  return (
    <div>
      {values.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 py-1 pl-3 pr-1 text-[13px] text-fg"
            >
              {accentColor && <span style={{ color: accentColor }}>♡</span>}
              {v}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:text-fg"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {values.length < max && (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={!draft.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/15 bg-surface/60 text-fg transition-all hover:border-accent/40 hover:bg-accent/10 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="mt-2 text-[11px] text-muted/50">
        {values.length}/{max}
      </div>
    </div>
  );
}

// ── Nav buttons ────────────────────────────────────────────────────
function StepNav({
  step,
  totalSteps,
  canNext: canAdvance,
  onBack,
  onNext,
  submitting,
  accentFrom,
  accentTo,
}: {
  step: number;
  totalSteps: number;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
  accentFrom: string;
  accentTo: string;
}) {
  const isLast = step === totalSteps - 1;
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        disabled={step === 0}
        className="inline-flex items-center gap-2 rounded-full border border-border/15 bg-surface/60 px-5 py-2.5 text-[14px] text-muted transition-all hover:border-border/30 hover:text-fg disabled:pointer-events-none disabled:opacity-0"
      >
        <ArrowLeft className="h-4 w-4" />
        tillbaka
      </button>

      <button
        type={isLast ? "submit" : "button"}
        onClick={isLast ? undefined : onNext}
        disabled={!canAdvance || submitting}
        className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-medium text-[#0d0c11] shadow-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        style={{
          background: `linear-gradient(100deg, ${accentFrom}, ${accentTo})`,
        }}
      >
        {submitting ? (
          <>
            <Spinner />
            skapar…
          </>
        ) : isLast ? (
          <>
            skapa länk
            <Heart className="h-4 w-4 fill-current" strokeWidth={0} />
          </>
        ) : (
          <>
            nästa
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────
// ── Share success screen ──────────────────────────────────────────
function ShareSuccess({
  result,
  accentFrom,
  accentTo,
}: {
  result: Result;
  accentFrom: string;
  accentTo: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="mx-auto max-w-lg text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[#0d0c11]"
        style={{
          background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
        }}
      >
        <Check className="h-8 w-8" strokeWidth={2.2} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 font-display text-3xl font-medium text-fg"
      >
        länken är klar ♡
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-2 text-muted"
      >
        dela den med en enda person. resten sköter den själv.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-7 flex items-center gap-2 rounded-full border border-border/15 bg-surface/60 p-1.5 pl-5"
      >
        <span className="min-w-0 flex-1 truncate text-left text-[14px] text-muted">
          {result.url}
        </span>
        <button
          onClick={copy}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium text-[#0d0c11] transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(100deg, ${accentFrom}, ${accentTo})`,
          }}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "kopierad!" : "kopiera"}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6 flex items-center justify-center gap-5 text-[14px]"
      >
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-fg transition-colors hover:text-accent"
        >
          <ExternalLink className="h-4 w-4" /> förhandsgranska
        </a>
        <Link
          href="/studio/new"
          className="text-muted transition-colors hover:text-fg"
        >
          skapa en till
        </Link>
        <Link
          href="/studio"
          className="text-muted transition-colors hover:text-fg"
        >
          till översikten
        </Link>
      </motion.div>
    </div>
  );
}

export function CreateInviteForm({
  cancelHref = "/studio",
}: {
  cancelHref?: string;
}) {
  // step
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward

  // core fields
  const [template, setTemplate] = useState<TemplateId>("coffee");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [headline, setHeadline] = useState(TEMPLATES.coffee.defaultHeadline);
  const [message, setMessage] = useState(TEMPLATES.coffee.defaultMessage);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [askTiming, setAskTiming] = useState(true);
  const [playfulNo, setPlayfulNo] = useState(true);
  const [dateOptions, setDateOptions] = useState<string[]>([]);
  const [dateDraft, setDateDraft] = useState("");
  const [stickerPack, setStickerPack] = useState<StickerPack>("mixed");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [secretNote, setSecretNote] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(0);
  const [touched, setTouched] = useState<{ h: boolean; m: boolean }>({
    h: false,
    m: false,
  });

  // extras
  const [bgTheme, setBgTheme] = useState<BgTheme>("none");
  const [reasons, setReasons] = useState<string[]>([]);
  const [reasonDraft, setReasonDraft] = useState("");
  const [countdown, setCountdown] = useState("");
  const [musicUrl, setMusicUrl] = useState(
    "https://open.spotify.com/track/4jDmJ51x1o9NZB5Nxxc7gY?si=ef86dd59634741f6",
  );
  const [musicLabel, setMusicLabel] = useState("");
  const [yesText, setYesText] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizDraft, setQuizDraft] = useState("");
  const [quizOptDraft, setQuizOptDraft] = useState("");
  const [editingQuizIdx, setEditingQuizIdx] = useState<number | null>(null);
  const [gifs, setGifs] = useState<{ url: string; caption: string }[]>([]);

  // form state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const t = TEMPLATES[template];

  // ── Helpers ────────────────────────────────────────────────────
  function pickTemplate(id: TemplateId) {
    setTemplate(id);
    if (!touched.h) setHeadline(TEMPLATES[id].defaultHeadline);
    if (!touched.m) setMessage(TEMPLATES[id].defaultMessage);
  }

  function addDateOption() {
    const v = dateDraft.trim();
    if (!v || dateOptions.length >= 5 || dateOptions.includes(v)) {
      if (dateOptions.includes(v)) setDateDraft("");
      return;
    }
    setDateOptions([...dateOptions, v]);
    setDateDraft("");
  }

  function addReason() {
    const v = reasonDraft.trim();
    if (!v || reasons.length >= 5 || reasons.includes(v)) return;
    setReasons([...reasons, v]);
    setReasonDraft("");
  }

  function addQuizQuestion() {
    const q = quizDraft.trim();
    if (!q || quiz.length >= 3) return;
    setQuiz([...quiz, { q, opts: [] }]);
    setQuizDraft("");
    setEditingQuizIdx(quiz.length);
  }

  function addQuizOpt(qIdx: number) {
    const v = quizOptDraft.trim();
    if (!v) return;
    const updated = quiz.map((item, i) =>
      i === qIdx && item.opts.length < 4
        ? { ...item, opts: [...item.opts, v] }
        : item,
    );
    setQuiz(updated);
    setQuizOptDraft("");
  }

  function removeQuizOpt(qIdx: number, optIdx: number) {
    setQuiz(
      quiz.map((item, i) =>
        i === qIdx
          ? { ...item, opts: item.opts.filter((_, j) => j !== optIdx) }
          : item,
      ),
    );
  }

  function removeQuizQuestion(idx: number) {
    setQuiz(quiz.filter((_, i) => i !== idx));
    if (editingQuizIdx === idx) setEditingQuizIdx(null);
  }

  function goNext() {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step validation
  const canAdvance =
    step === 0
      ? true // template always selected
      : step === 1
        ? recipientName.trim().length > 0 && headline.trim().length > 0
        : true;

  // ── Submit ─────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // safety net — should never fire with no submit button
  }

  async function handleCreate() {
    setError(null);
    setSubmitting(true);

    const extras: InviteExtras = {
      bgTheme: bgTheme !== "none" ? bgTheme : undefined,
      reasons: reasons.length > 0 ? reasons : undefined,
      countdown: countdown || undefined,
      musicUrl: musicUrl || undefined,
      musicLabel: musicLabel || undefined,
      yesText: yesText || undefined,
      quiz:
        quiz.filter((q) => q.opts.length >= 2).length > 0
          ? quiz.filter((q) => q.opts.length >= 2)
          : undefined,
      gifs:
        gifs.filter((g) => g.url.trim()).length > 0
          ? gifs
              .filter((g) => g.url.trim())
              .map((g) => ({
                url: g.url.trim(),
                caption: g.caption.trim() || undefined,
              }))
          : undefined,
    };

    const res = await createInvitation({
      recipientName,
      senderName: senderName || undefined,
      template,
      headline,
      message: message || undefined,
      heroImageUrl: heroImageUrl || undefined,
      notifyEmail: notifyEmail || undefined,
      askTiming,
      playfulNo,
      dateOptions,
      stickerPack,
      photoCaption: photoCaption || undefined,
      secretNote: secretNote || undefined,
      expiresInDays: expiresInDays || undefined,
      extras,
    });

    setSubmitting(false);
    if (!res.ok || !res.url) {
      setError(res.error ?? "något gick fel.");
      return;
    }
    setResult({ slug: res.slug!, url: res.url });
  }

  if (result)
    return <ShareSuccess result={result} accentFrom={t.from} accentTo={t.to} />;

  // Preview extras
  const previewExtras: InviteExtras = {
    bgTheme: bgTheme !== "none" ? bgTheme : undefined,
    reasons: reasons.length > 0 ? reasons : undefined,
    countdown: countdown || undefined,
    musicUrl: musicUrl || undefined,
    musicLabel: musicLabel || undefined,
    yesText: yesText || undefined,
    gifs:
      gifs.filter((g) => g.url.trim()).length > 0
        ? gifs
            .filter((g) => g.url.trim())
            .map((g) => ({
              url: g.url.trim(),
              caption: g.caption.trim() || undefined,
            }))
        : undefined,
  };

  // Slide variants
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="font-display text-[2.2rem] font-medium leading-[1.05] tracking-tightest text-fg sm:text-5xl"
        >
          vem ska du <span className="text-gradient italic">fråga</span>?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-3 text-[15px] text-muted"
        >
          fyra enkla steg. sedan en länk.
        </motion.p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.85fr]"
        noValidate
      >
        {/* ── Left: steps ── */}
        <div>
          <StepProgress step={step} accentFrom={t.from} accentTo={t.to} />

          {/* Animated step content */}
          <div className="relative min-h-[520px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease }}
                className="space-y-6"
              >
                {/* ═══ STEP 0 – Stämning ═══════════════════════════════════ */}
                {step === 0 && (
                  <>
                    <div>
                      <div className="mb-1 text-[13px] font-medium uppercase tracking-[0.12em] text-muted/70">
                        välj stämning
                      </div>
                      <p className="text-[13px] text-muted">
                        grundtonen för hela inbjudan — färger, känsla, allt.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {TEMPLATE_LIST.map((tmpl) => (
                        <button
                          type="button"
                          key={tmpl.id}
                          onClick={() => pickTemplate(tmpl.id)}
                          className={cn(
                            "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
                            template === tmpl.id
                              ? "border-transparent shadow-[0_0_0_2px_rgb(var(--accent)/0.6)]"
                              : "border-border/15 hover:border-border/30 hover:-translate-y-0.5",
                          )}
                        >
                          {template === tmpl.id && (
                            <span
                              className="absolute inset-0 opacity-[0.07]"
                              style={{
                                background: `linear-gradient(135deg, ${tmpl.from}, ${tmpl.to})`,
                              }}
                            />
                          )}
                          <span
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#0d0c11] shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${tmpl.from}, ${tmpl.to})`,
                            }}
                          >
                            <TemplateIcon
                              name={tmpl.icon}
                              className="h-[18px] w-[18px]"
                            />
                          </span>
                          <div className="mt-2.5 text-[14px] font-medium text-fg">
                            {tmpl.label}
                          </div>
                          <div className="mt-0.5 text-[12px] text-muted/70">
                            {tmpl.mood}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-border/10 bg-surface/40 p-5">
                      <div className="text-[13px] font-medium text-muted/70 mb-3 uppercase tracking-[0.12em]">
                        stickers i bakgrunden
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {STICKER_PACK_CHOICES.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => setStickerPack(p.id)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all",
                              stickerPack === p.id
                                ? "border-transparent shadow-[0_0_0_2px_rgb(var(--accent)/0.5)] bg-accent/5"
                                : "border-border/15 hover:border-border/30",
                            )}
                          >
                            <span className="text-[20px] leading-none">
                              {p.preview}
                            </span>
                            <span className="text-[11px] text-fg/70">
                              {p.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ═══ STEP 1 – Innehåll ═══════════════════════════════════ */}
                {step === 1 && (
                  <>
                    <div>
                      <div className="mb-1 text-[13px] font-medium uppercase tracking-[0.12em] text-muted/70">
                        till & från
                      </div>
                      <p className="text-[13px] text-muted">
                        vem är det till? skriv som du brukar.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="till vem?" hint="förnamn räcker.">
                        <Input
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          maxLength={60}
                          placeholder="Sofia"
                          required
                          autoFocus
                        />
                      </Field>
                      <Field label="från (valfritt)">
                        <Input
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          maxLength={60}
                          placeholder="Melvin"
                        />
                      </Field>
                    </div>

                    <Field label="rubrik" hint="det allra första som syns.">
                      <Input
                        value={headline}
                        onChange={(e) => {
                          setHeadline(e.target.value);
                          setTouched((prev) => ({ ...prev, h: true }));
                        }}
                        maxLength={160}
                        required
                      />
                    </Field>

                    <Field
                      label="meddelande"
                      hint="skriv som du pratar. kort är bra."
                    >
                      <Textarea
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          setTouched((prev) => ({ ...prev, m: true }));
                        }}
                        maxLength={600}
                      />
                    </Field>
                  </>
                )}

                {/* ═══ STEP 2 – Extras ═════════════════════════════════════ */}
                {step === 2 && (
                  <>
                    <div>
                      <div className="mb-1 text-[13px] font-medium uppercase tracking-[0.12em] text-muted/70">
                        extra charm
                      </div>
                      <p className="text-[13px] text-muted">
                        allt är valfritt. lägg till det som passar er.
                      </p>
                    </div>

                    {/* Animerad bakgrund */}
                    <SectionCard
                      icon={Palette}
                      title="animerad bakgrund"
                      subtitle="en levande bakgrund bakom inbjudan."
                      badge="nytt"
                    >
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {BG_THEMES.map((th) => (
                          <div key={th} onClick={() => setBgTheme(th)}>
                            <BgThemePreview
                              theme={th}
                              active={bgTheme === th}
                            />
                          </div>
                        ))}
                      </div>
                    </SectionCard>

                    {/* Skäl att säga ja */}
                    <SectionCard
                      icon={Sparkles}
                      title="skäl att säga ja"
                      subtitle="upp till 5 korta anledningar."
                      badge="nytt"
                    >
                      <ChipInput
                        values={reasons}
                        onAdd={addReason}
                        onRemove={(i) =>
                          setReasons(reasons.filter((_, j) => j !== i))
                        }
                        draft={reasonDraft}
                        onDraftChange={setReasonDraft}
                        placeholder={`t.ex. "du skrattar åt mina dåliga skämt"`}
                        max={5}
                        accentColor="rgb(var(--accent))"
                      />
                    </SectionCard>

                    {/* Musik */}
                    <SectionCard
                      icon={Music}
                      title="musikvibe"
                      subtitle="klistra in en Spotify-länk — autoplay när hon öppnar."
                      badge="nytt"
                    >
                      <input
                        type="url"
                        value={musicUrl}
                        onChange={(e) => setMusicUrl(e.target.value)}
                        placeholder="https://open.spotify.com/track/..."
                        className="w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all"
                      />
                      {musicUrl && (
                        <>
                          <input
                            type="text"
                            value={musicLabel}
                            onChange={(e) => setMusicLabel(e.target.value)}
                            maxLength={60}
                            placeholder='etikett, t.ex. "vår låt" (valfritt)'
                            className="mt-2 w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-all"
                          />
                          <div className="mt-3 flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#0d0c11] text-sm">
                              ♫
                            </span>
                            <div>
                              <div className="text-[12px] font-medium text-fg">
                                {musicLabel || "musikvibe"}
                              </div>
                              <div className="text-[11px] text-muted">
                                spelar automatiskt när länken öppnas
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </SectionCard>

                    {/* Nerräkning */}
                    <SectionCard
                      icon={Timer}
                      title="nerräkning"
                      subtitle="live-nerräkning till dejten."
                      badge="nytt"
                    >
                      <input
                        type="datetime-local"
                        value={countdown}
                        onChange={(e) => setCountdown(e.target.value)}
                        className="w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all"
                      />
                      {countdown && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/10 bg-surface/60 p-3">
                          <Timer className="h-4 w-4 text-accent/70 shrink-0" />
                          <span className="text-[13px] italic text-muted">
                            nerräkning till{" "}
                            {new Date(countdown).toLocaleString("sv-SE", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            visas på inbjudan.
                          </span>
                        </div>
                      )}
                    </SectionCard>

                    {/* Ja-knapp */}
                    <SectionCard
                      icon={MessageCircle}
                      title='anpassa "ja"-knappen'
                      subtitle="vad ska stå på den stora knappen?"
                      badge="nytt"
                    >
                      <input
                        type="text"
                        value={yesText}
                        onChange={(e) => setYesText(e.target.value)}
                        maxLength={50}
                        placeholder="ja ♡"
                        className="w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-all"
                      />
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {YES_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setYesText(s)}
                            className={cn(
                              "rounded-full border px-3 py-1 text-[12px] transition-all",
                              yesText === s
                                ? "border-transparent bg-gradient-to-r from-accent to-accent-2 text-[#0d0c11]"
                                : "border-border/15 text-muted hover:border-border/30 hover:text-fg",
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </SectionCard>

                    {/* GIF / bilder — upp till 4, en per slide */}
                    <SectionCard
                      icon={Clapperboard}
                      title="gifs &amp; bilder"
                      subtitle="välj en mall-gif eller klistra in egen länk — en gif per slide."
                      badge="nytt"
                    >
                      {/* Mall-GIFs — klickbara förslag */}
                      <div className="mb-4">
                        <p className="mb-2 text-[11px] uppercase tracking-wider text-muted/60">
                          mall-gifs — klicka för att använda
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {GIF_TEMPLATES.map((tpl) => {
                            const activeIdx = Math.max(
                              0,
                              gifs.findIndex((g) => !g.url.trim()),
                              gifs.length < 4 ? gifs.length : 4,
                            );
                            const isUsed = gifs.some((g) => g.url === tpl.url);
                            return (
                              <button
                                key={tpl.url}
                                type="button"
                                title={tpl.label}
                                onClick={() => {
                                  if (isUsed) return;
                                  const insertIdx = gifs.findIndex(
                                    (g) => !g.url.trim(),
                                  );
                                  const idx =
                                    insertIdx === -1 ? gifs.length : insertIdx;
                                  if (idx >= 4) return;
                                  setGifs((prev) => {
                                    const next = [...prev];
                                    while (next.length <= idx)
                                      next.push({ url: "", caption: "" });
                                    next[idx] = {
                                      url: tpl.url,
                                      caption: tpl.label,
                                    };
                                    return next;
                                  });
                                }}
                                className={[
                                  "group relative overflow-hidden rounded-xl border-2 transition-all",
                                  isUsed
                                    ? "border-accent/60 opacity-60 cursor-default"
                                    : "border-transparent hover:border-accent/50 hover:scale-105 cursor-pointer",
                                ].join(" ")}
                                style={{ aspectRatio: "1" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={tpl.url}
                                  alt={tpl.label}
                                  className="h-full w-full object-cover"
                                />
                                {isUsed && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Check
                                      className="h-4 w-4 text-white"
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                )}
                                {!isUsed && (
                                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pb-1">
                                    <span className="text-[9px] font-medium text-white">
                                      välj
                                    </span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-[11px] text-muted/50">
                          eller klistra in egen länk
                        </span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      {/* Per-slide slots */}
                      {[0, 1, 2, 3].map((idx) => {
                        const g = gifs[idx] ?? { url: "", caption: "" };
                        const slideLabel = [
                          "startsidan 🎬",
                          "brevet 💌",
                          "efter svaret ✨",
                          "bonusbild 🎉",
                        ][idx];
                        const isActive =
                          idx === 0 || gifs[idx - 1]?.url.trim().length > 0;
                        if (!isActive) return null;
                        return (
                          <div
                            key={idx}
                            className="mb-3 rounded-2xl border border-border/10 bg-surface/40 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[11px] font-medium uppercase tracking-wider text-muted/70">
                                {slideLabel}
                              </span>
                              {g.url && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setGifs((prev) =>
                                      prev
                                        .map((x, i) =>
                                          i === idx
                                            ? { url: "", caption: "" }
                                            : x,
                                        )
                                        .filter((x, i) => i < idx || x.url),
                                    )
                                  }
                                  className="text-muted/40 hover:text-fg transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Preview if URL is filled */}
                            {g.url.trim() ? (
                              <div className="space-y-2">
                                <div
                                  className="overflow-hidden rounded-xl border border-white/10 bg-surface/80 shadow-sm"
                                  style={{ padding: "6px 6px 3px" }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={g.url}
                                    alt={`gif ${idx + 1}`}
                                    className="block max-h-44 w-full rounded-lg object-cover"
                                  />
                                  {g.caption && (
                                    <div className="mt-1 pb-0.5 text-center text-[11px] italic text-muted/70">
                                      {g.caption}
                                    </div>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={g.caption}
                                  onChange={(e) =>
                                    setGifs((prev) => {
                                      const next = [...prev];
                                      next[idx] = {
                                        ...next[idx],
                                        caption: e.target.value,
                                      };
                                      return next;
                                    })
                                  }
                                  maxLength={80}
                                  placeholder="bildtext (valfritt)"
                                  className="w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-all"
                                />
                              </div>
                            ) : (
                              <input
                                type="url"
                                value={g.url}
                                onChange={(e) =>
                                  setGifs((prev) => {
                                    const next = [...prev];
                                    while (next.length <= idx)
                                      next.push({ url: "", caption: "" });
                                    next[idx] = {
                                      ...next[idx],
                                      url: e.target.value,
                                    };
                                    return next;
                                  })
                                }
                                placeholder="https://media.giphy.com/…"
                                className="w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/10 transition-all"
                              />
                            )}
                          </div>
                        );
                      })}
                    </SectionCard>

                    {/* Mini-quiz */}
                    <SectionCard
                      icon={Gamepad2}
                      title="mini-quiz"
                      subtitle="1–3 frågor innan inbjudan öppnar. alla svar är rätt."
                      badge="nytt"
                    >
                      {quiz.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="mb-3 rounded-xl border border-border/10 bg-surface/60 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[13px] font-medium text-fg">
                              {qIdx + 1}. {q.q}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuizQuestion(qIdx)}
                              className="shrink-0 text-muted/50 hover:text-fg"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {q.opts.map((opt, optIdx) => (
                              <span
                                key={optIdx}
                                className="inline-flex items-center gap-1 rounded-full border border-border/15 bg-surface px-2.5 py-1 text-[12px] text-fg"
                              >
                                {opt}
                                <button
                                  type="button"
                                  onClick={() => removeQuizOpt(qIdx, optIdx)}
                                  className="text-muted/50 hover:text-fg"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                          {q.opts.length < 4 && editingQuizIdx === qIdx && (
                            <div className="mt-2 flex gap-2">
                              <input
                                value={quizOptDraft}
                                onChange={(e) =>
                                  setQuizOptDraft(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addQuizOpt(qIdx);
                                  }
                                }}
                                maxLength={60}
                                placeholder="svarsalternativ…"
                                className="flex-1 rounded-lg border border-border/15 bg-surface px-2.5 py-1.5 text-[13px] text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => addQuizOpt(qIdx)}
                                disabled={!quizOptDraft.trim()}
                                className="rounded-lg border border-border/15 px-2.5 py-1.5 text-[12px] text-muted hover:text-fg disabled:opacity-40"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          {editingQuizIdx !== qIdx && (
                            <button
                              type="button"
                              onClick={() => setEditingQuizIdx(qIdx)}
                              className="mt-2 text-[11px] italic text-muted/60 hover:text-muted"
                            >
                              + lägg till alternativ
                            </button>
                          )}
                        </div>
                      ))}
                      {quiz.length < 3 && (
                        <div className="flex gap-2">
                          <input
                            value={quizDraft}
                            onChange={(e) => setQuizDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addQuizQuestion();
                              }
                            }}
                            maxLength={120}
                            placeholder='t.ex. "vilken dejt passar dig?"'
                            className="flex-1 rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/50 focus:border-accent/60 focus:outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={addQuizQuestion}
                            disabled={!quizDraft.trim()}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/15 bg-surface/60 text-fg transition-all hover:border-accent/40 hover:bg-accent/10 disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {quiz.some((q) => q.opts.length < 2) && (
                        <p className="mt-2 text-[11px] italic text-muted/60">
                          varje fråga behöver minst 2 svarsalternativ för att
                          sparas.
                        </p>
                      )}
                    </SectionCard>
                  </>
                )}

                {/* ═══ STEP 3 – Detaljer ═══════════════════════════════════ */}
                {step === 3 && (
                  <>
                    <div>
                      <div className="mb-1 text-[13px] font-medium uppercase tracking-[0.12em] text-muted/70">
                        sista detaljerna
                      </div>
                      <p className="text-[13px] text-muted">
                        allt valfritt. tryck "skapa länk" när du är redo.
                      </p>
                    </div>

                    {/* Tider */}
                    <div className="rounded-2xl border border-border/10 bg-surface/40 p-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <div>
                          <div className="text-[14px] font-medium text-fg">
                            föreslå tider
                          </div>
                          <div className="mt-0.5 text-[12px] text-muted">
                            går att bocka i. max 5.
                          </div>
                        </div>
                        <div className="text-[12px] text-muted">
                          {dateOptions.length}/5
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {dateOptions.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/15 bg-surface/70 py-1 pl-3 pr-1 text-[13px] text-fg"
                          >
                            {d}
                            <button
                              type="button"
                              onClick={() =>
                                setDateOptions(
                                  dateOptions.filter((x) => x !== d),
                                )
                              }
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-fg"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      {dateOptions.length < 5 && (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            value={dateDraft}
                            onChange={(e) => setDateDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addDateOption();
                              }
                            }}
                            maxLength={80}
                            placeholder="t.ex. fredag 19:30 — sushi"
                            className="flex-1 rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/60 focus:border-accent/60 focus:outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={addDateOption}
                            disabled={!dateDraft.trim()}
                            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border/15 bg-surface/60 px-3 text-[13px] text-fg transition-all hover:border-border/30 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" /> lägg till
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hemlig rad */}
                    <div className="rounded-2xl border border-border/10 bg-surface/40 p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="h-3.5 w-3.5 text-muted" />
                        <span className="text-[14px] font-medium text-fg">
                          hemlig rad
                        </span>
                        <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[11px] text-muted">
                          valfritt
                        </span>
                      </div>
                      <div className="text-[12px] text-muted mb-3">
                        ett dolt meddelande. syns först när man trycker.
                      </div>
                      <input
                        value={secretNote}
                        onChange={(e) => setSecretNote(e.target.value)}
                        maxLength={240}
                        placeholder="t.ex. okej men jag vill verkligen jättegärna idag"
                        className="w-full rounded-xl border border-border/15 bg-surface/60 px-3 py-2.5 text-[14px] text-fg placeholder:text-muted/60 focus:border-accent/60 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <Field
                      label="maila svaret till"
                      hint="vi pingar dig när hon svarar."
                    >
                      <Input
                        type="email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        maxLength={160}
                        placeholder="du@exempel.se"
                      />
                    </Field>

                    {/* Toggles */}
                    <div className="space-y-4 rounded-2xl border border-border/10 bg-surface/40 p-5">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={playfulNo}
                          onChange={(e) => setPlayfulNo(e.target.checked)}
                          className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                        />
                        <span>
                          <span className="block text-[14px] font-medium text-fg">
                            busig nej-knapp
                          </span>
                          <span className="block text-[12px] text-muted mt-0.5">
                            "nej" springer undan när man försöker klicka.
                          </span>
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={askTiming}
                          onChange={(e) => setAskTiming(e.target.checked)}
                          className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
                        />
                        <span>
                          <span className="block text-[14px] font-medium text-fg">
                            fråga när det passar
                          </span>
                          <span className="block text-[12px] text-muted mt-0.5">
                            snabbalternativ (ikväll, i helgen…)
                          </span>
                        </span>
                      </label>

                      <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/10">
                        <span className="text-[14px] text-muted">
                          länken förfaller
                        </span>
                        <select
                          value={expiresInDays}
                          onChange={(e) =>
                            setExpiresInDays(Number(e.target.value))
                          }
                          className="rounded-xl border border-border/15 bg-surface px-3 py-1.5 text-[13px] text-fg focus:outline-none"
                        >
                          <option value={0}>aldrig</option>
                          <option value={7}>om 7 dagar</option>
                          <option value={30}>om 30 dagar</option>
                        </select>
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-[14px] text-accent"
                      >
                        {error}
                      </motion.p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Navigation ── */}
          <div className="mt-8 flex items-center justify-between border-t border-border/10 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border/15 px-5 py-2.5 text-[14px] text-muted transition-all hover:border-border/30 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              tillbaka
            </button>

            <button
              type="button"
              onClick={step < TOTAL_STEPS - 1 ? goNext : handleCreate}
              disabled={!canAdvance || submitting}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-medium text-[#0d0c11] transition-all hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
              style={{
                background: `linear-gradient(100deg, ${t.from}, ${t.to})`,
                boxShadow: `0 0 20px color-mix(in srgb, ${t.from} 25%, transparent)`,
              }}
            >
              {step < TOTAL_STEPS - 1 ? (
                <>
                  nästa
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : submitting ? (
                <Spinner />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  skapa inbjudan
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Right: live preview ── */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <p className="mb-3 text-[11px] uppercase tracking-wider text-muted/50">
              förhandsvisning
            </p>
            <InvitePreview
              template={template}
              recipientName={recipientName || "namn"}
              headline={headline || "din rubrik…"}
              message={message || ""}
              senderName={senderName || undefined}
              heroImageUrl={heroImageUrl || undefined}
              photoCaption={photoCaption || undefined}
              stickerPack={stickerPack}
              playfulNo={playfulNo}
              dateOptions={dateOptions}
              extras={previewExtras}
            />
          </div>
        </div>
      </form>
    </>
  );
}
