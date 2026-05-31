"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Unlock, Check, Copy, ExternalLink, Shield,
  Heart, Sparkles, Star, ArrowRight
} from "lucide-react";
import { InvitePreview } from "@/components/studio/InvitePreview";
import type { TemplateId } from "@/lib/templates";
import type { InviteExtras, StickerPack } from "@/lib/types";
import { cn } from "@/lib/utils";

// Social proof counter — feels live, changes slowly
const INVITE_COUNT = "4 127";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angerrattConfirmed, setAngerrattConfirmed] = useState(false);
  const firstName = recipientName.split(" ")[0] ?? recipientName;

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    try {
      if (!angerrattConfirmed) {
        setError("Du måste bekräfta att du förstår att ångerrätten förfaller.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, confirmedAt: new Date().toISOString() }),
      });
      const data = await res.json() as { url?: string; redirect_url?: string; already_unlocked?: boolean; error?: string };

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

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          <Sparkles className="h-7 w-7 text-[#0d0c11]" />
        </motion.div>
        <h2 className="font-display text-3xl font-medium text-fg">
          inbjudan redo ✨
        </h2>
        <p className="mt-1.5 text-[15px] text-muted">
          se exakt vad {firstName} kommer uppleva
        </p>
      </motion.div>

      {/* ── Preview card with paywall overlay ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[1.75rem]"
      >
        {/* The actual invite preview */}
        <div className="pointer-events-none select-none">
          <InvitePreview
            template={template}
            recipientName={recipientName}
            headline={headline}
            message={message}
            senderName={senderName}
            heroImageUrl={heroImageUrl}
            photoCaption={photoCaption ?? undefined}
            stickerPack={stickerPack}
            playfulNo={playfulNo}
            dateOptions={dateOptions}
            extras={extras}
          />
        </div>

        {/* Fade-to-blur overlay at bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44"
          style={{
            background: "linear-gradient(to top, var(--color-bg) 30%, transparent 100%)",
          }}
        />

        {/* HejSöt watermark badge */}
        <div
          aria-hidden
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-border/20 bg-bg/80 px-2.5 py-1 backdrop-blur-sm"
        >
          <Heart className="h-3 w-3 fill-current" style={{ color: accentFrom }} strokeWidth={0} />
          <span className="font-display text-[11px] italic text-muted/80">hejsöt preview</span>
          <Lock className="h-2.5 w-2.5 text-muted/60" />
        </div>
      </motion.div>

      {/* ── Paywall card ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 overflow-hidden rounded-[1.75rem] border border-border/15 bg-surface/60 p-6"
      >
        {/* Value prop */}
        <div className="mb-5 space-y-3">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${accentFrom}40, ${accentTo}40)` }}
            >
              <Check className="h-3 w-3" style={{ color: accentTo }} strokeWidth={2.5} />
            </div>
            <p className="text-[14px] text-fg/90">
              <span className="font-medium">{firstName}</span> får en personlig sida som ser ut som om du lagt ner timmar på den
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${accentFrom}40, ${accentTo}40)` }}
            >
              <Check className="h-3 w-3" style={{ color: accentTo }} strokeWidth={2.5} />
            </div>
            <p className="text-[14px] text-fg/90">
              länken fungerar direkt — inga appar, inga konton
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${accentFrom}40, ${accentTo}40)` }}
            >
              <Check className="h-3 w-3" style={{ color: accentTo }} strokeWidth={2.5} />
            </div>
            <p className="text-[14px] text-fg/90">
              du får ett mail när {firstName} svarar
            </p>
          </div>
        </div>

        {/* ── Ångerrättsbekräftelse (Distansavtalslagen 2 kap. 11 §) ── */}
        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border/15 bg-surface/40 p-3.5 transition-colors hover:border-border/30">
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
                borderColor: angerrattConfirmed ? accentTo : "rgb(var(--color-border) / 0.4)",
                background: angerrattConfirmed
                  ? `linear-gradient(135deg, ${accentFrom}, ${accentTo})`
                  : "transparent",
              }}
            >
              {angerrattConfirmed && (
                <svg viewBox="0 0 12 12" fill="none" className="h-full w-full p-0.5">
                  <path d="M2 6l3 3 5-5" stroke="#0d0c11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-muted/80">
            Jag förstår att tjänsten påbörjas omedelbart efter betalning och att{" "}
            <strong className="font-medium text-fg/90">ångerrätten därmed förfaller</strong>{" "}
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
        </label>

        {/* CTA button */}
        <button
          onClick={handleUnlock}
          disabled={loading || !angerrattConfirmed}
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl py-4 text-[16px] font-semibold text-[#0d0c11] transition-all",
            "hover:brightness-110 active:scale-[0.98]",
            "disabled:pointer-events-none disabled:opacity-70",
          )}
          style={{
            background: `linear-gradient(100deg, ${accentFrom}, ${accentTo})`,
            boxShadow: `0 8px 30px color-mix(in srgb, ${accentFrom} 35%, transparent)`,
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
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
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
                <span className="ml-1 rounded-full bg-black/15 px-2 py-0.5 text-[13px] font-medium">
                  19 kr
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-center text-[13px] text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Trust signals */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1 text-[12px] text-muted/70">
            <Shield className="h-3 w-3" /> Säker betalning via Stripe
          </span>
          <span className="flex items-center gap-1 text-[12px] text-muted/70">
            <Star className="h-3 w-3" /> Nöjd-garanti
          </span>
          <span className="flex items-center gap-1 text-[12px] text-muted/70">
            <Heart className="h-3 w-3" fill="currentColor" strokeWidth={0} />
            {INVITE_COUNT} inbjudningar skickade
          </span>
        </div>

        {/* Microcopy: what happens next */}
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted/50">
          efter betalning får du en unik länk att kopiera och skicka till {firstName}.
          vi lagrar inga kortuppgifter — allt hanteras av stripe.
        </p>
      </motion.div>

      {/* ── Preview link (locked) ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4 flex items-center gap-2 rounded-full border border-border/10 bg-surface/40 p-1.5 pl-5"
      >
        <Lock className="h-3.5 w-3.5 shrink-0 text-muted/40" />
        <span className="min-w-0 flex-1 truncate text-left text-[13px] text-muted/40 blur-[3px] select-none">
          hejsot.lol/i/{slug}
        </span>
        <button
          disabled
          className="inline-flex h-8 items-center gap-1 rounded-full bg-surface px-4 text-[12px] text-muted/40 cursor-not-allowed"
        >
          <Lock className="h-3 w-3" />
          låst
        </button>
      </motion.div>
      <p className="mt-2 text-center text-[11px] text-muted/40">
        länken låses upp direkt efter betalning
      </p>
    </div>
  );
}
