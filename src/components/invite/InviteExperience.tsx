"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { PublicInvitation, AnswerType } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { recordView, submitResponse } from "@/actions/respond";

type Stage = "sealed" | "open" | "respond" | "done";

const TIMING_CHIPS = ["Ikväll", "I helgen", "Nästa vecka", "Snart"];

// Explicit tuple type so framer-motion accepts it (a readonly tuple from
// `as const` wouldn't match its mutable BezierDefinition).
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function InviteExperience({ invitation }: { invitation: PublicInvitation }) {
  const t = getTemplate(invitation.template);
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("sealed");
  const [answerType, setAnswerType] = useState<AnswerType>("yes");
  const [customText, setCustomText] = useState("");
  const [timing, setTiming] = useState<string>("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Count a view once, shortly after mount (avoids prefetch/bot inflation).
  useEffect(() => {
    const id = setTimeout(() => void recordView(invitation.slug), 800);
    return () => clearTimeout(id);
  }, [invitation.slug]);

  const accentStyle = {
    "--from": t.from,
    "--to": t.to,
    "--accent": t.accent,
  } as React.CSSProperties;

  function choose(type: AnswerType) {
    setAnswerType(type);
    setStage("respond");
  }

  async function send() {
    setError(null);
    const answer =
      answerType === "yes"
        ? "Ja, gärna"
        : answerType === "maybe"
          ? "Kanske — fråga mig igen"
          : customText.trim();
    if (answerType === "custom" && !answer) {
      setError("Skriv något kort innan du skickar.");
      return;
    }
    setSubmitting(true);
    const res = await submitResponse({
      slug: invitation.slug,
      answerType,
      answer,
      timing: timing || undefined,
      note: note.trim() || undefined,
      website,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Något gick fel. Försök igen.");
      return;
    }
    setStage("done");
  }

  return (
    <div style={accentStyle} className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Template ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--from) 26%, transparent), transparent 70%)," +
            "radial-gradient(50% 50% at 90% 100%, color-mix(in srgb, var(--to) 22%, transparent), transparent 70%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-content items-center justify-between px-5 py-5">
        <Logo href={null} />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-prose flex-1 flex-col justify-center px-6 pb-16">
        <AnimatePresence mode="wait">
          {stage === "sealed" && (
            <motion.div
              key="sealed"
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.8, ease }}
              className="text-center"
            >
              <div className="text-[12px] uppercase tracking-[0.2em] text-muted">till</div>
              <h1 className="mt-3 font-display text-5xl font-medium tracking-tightest text-fg sm:text-6xl">
                {invitation.recipientName}
              </h1>
              <p className="mx-auto mt-5 max-w-sm text-lg text-muted">
                Någon vill fråga dig något.
              </p>
              <button
                onClick={() => setStage("open")}
                className="group mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium text-[#0d0c11] transition-transform hover:-translate-y-[1px]"
                style={{ background: "linear-gradient(100deg, var(--from), var(--to))" }}
              >
                Öppna inbjudan
                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-[2px]" />
              </button>
            </motion.div>
          )}

          {stage === "open" && (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.7, ease }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.6, ease }}
                className="flex items-center gap-2 text-muted"
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#0d0c11]"
                  style={{ background: "linear-gradient(135deg, var(--from), var(--to))" }}
                >
                  <TemplateIcon name={t.icon} className="h-4 w-4" />
                </span>
                <span className="text-[12px] uppercase tracking-[0.18em]">{t.mood}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.7, ease }}
                className="mt-6 font-display text-4xl font-medium leading-[1.08] tracking-tightest text-fg sm:text-[3.25rem]"
              >
                {invitation.headline}
              </motion.h1>

              {invitation.message && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, duration: 0.7, ease }}
                  className="mt-6 text-lg leading-relaxed text-muted"
                >
                  {invitation.message}
                </motion.p>
              )}

              {invitation.senderName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="mt-6 font-display text-lg italic text-fg/80"
                >
                  — {invitation.senderName}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.7, ease }}
                className="mt-10 flex flex-col gap-3 sm:flex-row"
              >
                <button
                  onClick={() => choose("yes")}
                  className="flex-1 rounded-full px-6 py-4 text-center text-[16px] font-medium text-[#0d0c11] shadow-glow transition-transform hover:-translate-y-[1px]"
                  style={{ background: "linear-gradient(100deg, var(--from), var(--to))" }}
                >
                  Ja, gärna
                </button>
                <button
                  onClick={() => choose("maybe")}
                  className="flex-1 rounded-full border border-border/20 bg-surface/60 px-6 py-4 text-center text-[16px] font-medium text-fg backdrop-blur transition-colors hover:border-border/40"
                >
                  Kanske
                </button>
              </motion.div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                onClick={() => choose("custom")}
                className="mt-4 text-[14px] text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                Svara med egna ord
              </motion.button>
            </motion.div>
          )}

          {stage === "respond" && (
            <motion.div
              key="respond"
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.6, ease }}
            >
              <h2 className="font-display text-3xl font-medium leading-tight text-fg">
                {answerType === "yes"
                  ? "Fint. Låt oss göra det."
                  : answerType === "maybe"
                    ? "Helt okej — berätta vad du tänker."
                    : "Säg det med dina ord."}
              </h2>

              {answerType === "custom" && (
                <textarea
                  autoFocus
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={280}
                  placeholder="Skriv ditt svar…"
                  className="mt-6 min-h-[120px] w-full resize-y rounded-2xl border border-border/15 bg-surface/60 px-4 py-3 text-[15px] leading-relaxed text-fg placeholder:text-muted/60 focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                />
              )}

              {invitation.askTiming && answerType !== "custom" && (
                <div className="mt-7">
                  <div className="text-[13px] text-muted">När skulle passa?</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TIMING_CHIPS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setTiming(timing === c ? "" : c)}
                        className={
                          "rounded-full border px-4 py-2 text-[14px] transition-colors " +
                          (timing === c
                            ? "border-transparent text-[#0d0c11]"
                            : "border-border/20 text-muted hover:text-fg")
                        }
                        style={
                          timing === c
                            ? { background: "linear-gradient(100deg, var(--from), var(--to))" }
                            : undefined
                        }
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7">
                <div className="text-[13px] text-muted">
                  Lägg till en hälsning <span className="text-muted/50">(valfritt)</span>
                </div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                  placeholder="Något du vill säga…"
                  className="mt-3 w-full rounded-2xl border border-border/15 bg-surface/60 px-4 py-3 text-[15px] text-fg placeholder:text-muted/60 focus:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                />
              </div>

              {/* Honeypot: hidden from humans, catches bots. */}
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              {error && <p className="mt-4 text-[14px] text-accent">{error}</p>}

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={send}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium text-[#0d0c11] transition-transform hover:-translate-y-[1px] disabled:opacity-60"
                  style={{ background: "linear-gradient(100deg, var(--from), var(--to))" }}
                >
                  {submitting ? <Spinner /> : null}
                  Skicka svar
                </button>
                <button
                  onClick={() => setStage("open")}
                  className="text-[14px] text-muted transition-colors hover:text-fg"
                >
                  Tillbaka
                </button>
              </div>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[#0d0c11]"
                style={{ background: "linear-gradient(135deg, var(--from), var(--to))" }}
              >
                <Check className="h-7 w-7" strokeWidth={2.2} />
              </motion.div>
              <h2 className="mt-7 font-display text-4xl font-medium text-fg">
                {answerType === "yes"
                  ? "Då säger vi det."
                  : answerType === "maybe"
                    ? "Tack — det räcker långt."
                    : "Skickat."}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-lg text-muted">
                {answerType === "yes"
                  ? "Ditt svar är på väg. Ni ses snart."
                  : answerType === "maybe"
                    ? "Ingen brådska. Ditt svar är skickat."
                    : "Dina ord är på väg."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
