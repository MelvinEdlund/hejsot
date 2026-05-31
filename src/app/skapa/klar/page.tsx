"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  Heart,
  Sparkles,
  Link as LinkIcon,
  Share2,
} from "lucide-react";
import Link from "next/link";

// ── Konfetti ─────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const particles = Array.from({ length: 48 }, (_, i) => i);
  const colors = ["#ff7ca1", "#ffb347", "#b5f5c0", "#7ec8f7", "#e0b4f7", "#fff"];

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {particles.map((i) => {
        const x = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const dur = 1.4 + Math.random() * 0.8;
        const size = 6 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)]!;
        const rotate = Math.random() * 360;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${x}vw`, opacity: 1, rotate }}
            animate={{ y: "110vh", opacity: 0, rotate: rotate + 360 }}
            transition={{ duration: dur, delay, ease: [0.22, 0, 0.36, 1] }}
            className="absolute top-0"
            style={{
              width: size,
              height: size,
              borderRadius: i % 3 === 0 ? "50%" : 2,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Pulsing glow orb ─────────────────────────────────────────────
function GlowOrb() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, #ff7ca1 45%, transparent), transparent 70%)",
        }}
      />
    </motion.div>
  );
}

type State = "loading" | "ready" | "error";

function KlarInner() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const sessionId = params.get("session_id") ?? "";

  const [state, setState] = useState<State>("loading");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiShown = useRef(false);

  useEffect(() => {
    if (!slug) {
      setState("error");
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let attempt = 0;

    async function poll() {
      if (cancelled) return;
      try {
        const qs = new URLSearchParams({ slug });
        if (sessionId) qs.set("session_id", sessionId);
        const res = await fetch(`/api/verify-payment?${qs}`);
        const data = (await res.json()) as { unlocked?: boolean; url?: string };
        if (data.unlocked && data.url) {
          setInviteUrl(data.url);
          setState("ready");
          if (!confettiShown.current) {
            confettiShown.current = true;
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2800);
          }
          return;
        }
      } catch {
        /* retry */
      }
      attempt++;
      if (attempt >= 15) {
        setState("error");
        return;
      }
      const delay = Math.min(1000 * (1 + Math.floor(attempt / 2)), 4000);
      timeoutId = setTimeout(poll, delay);
    }

    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sessionId]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ url: inviteUrl, title: "Din HejSöt-inbjudan" });
      } catch {
        /* user cancelled */
      }
    } else {
      await copy();
    }
  }

  return (
    <>
      <Confetti active={showConfetti} />
      <AnimatePresence mode="wait">
        {/* ── Loading ──────────────────────────────────────────── */}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-transparent"
              style={{
                background:
                  "conic-gradient(from 0deg, #ff7ca1, #ffb347, #ff7ca1) padding-box, conic-gradient(from 0deg, #ff7ca1, #ffb347, #ff7ca1) border-box",
                borderImage: "conic-gradient(from 0deg, #ff7ca1, #ffb347) 1",
              }}
            >
              <Heart className="h-7 w-7 fill-current text-[#ff7ca1]" strokeWidth={0} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 font-display text-2xl font-medium text-fg"
            >
              låser upp din inbjudan…
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-[14px] text-muted"
            >
              ett ögonblick — vi förbereder allt
            </motion.p>

            {/* Animated dots */}
            <div className="mt-6 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-muted/60"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Ready ────────────────────────────────────────────── */}
        {state === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md text-center"
          >
            <GlowOrb />

            {/* Success orb */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #ff7ca1, #ffb347)",
                boxShadow:
                  "0 0 48px color-mix(in srgb, #ff7ca1 45%, transparent), 0 0 80px color-mix(in srgb, #ff7ca1 20%, transparent)",
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Check className="h-9 w-9 text-[#0d0c11]" strokeWidth={2.5} />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-display text-[2.4rem] font-medium leading-tight text-fg"
            >
              inbjudan upplåst ♡
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-2 text-[15px] text-muted"
            >
              kopiera länken och skicka den direkt
            </motion.p>

            {/* URL card */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 overflow-hidden rounded-2xl border border-border/15 bg-surface/60 backdrop-blur-sm"
            >
              {/* Gradient accent line */}
              <div
                className="h-0.5 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, #ff7ca1, #ffb347, transparent)",
                }}
              />
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-400/20 to-amber-400/20">
                  <LinkIcon className="h-4 w-4 text-pink-400" />
                </div>
                <span className="min-w-0 flex-1 truncate text-left text-[13px] text-fg/80">
                  {inviteUrl}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex border-t border-border/10">
                <button
                  onClick={copy}
                  className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-fg/70 transition-all hover:bg-surface/80 hover:text-fg"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">kopierad!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      kopiera
                    </>
                  )}
                </button>
                <div className="w-px bg-border/10" />
                <button
                  onClick={share}
                  className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-fg/70 transition-all hover:bg-surface/80 hover:text-fg"
                >
                  <Share2 className="h-4 w-4" />
                  dela
                </button>
                <div className="w-px bg-border/10" />
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-medium text-fg/70 transition-all hover:bg-surface/80 hover:text-fg"
                >
                  <ExternalLink className="h-4 w-4" />
                  öppna
                </a>
              </div>
            </motion.div>

            {/* Tips card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-5 overflow-hidden rounded-2xl border border-border/10 bg-surface/30 px-5 py-4 text-left"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
                <div>
                  <p className="text-[13px] font-medium text-fg">
                    pro-tips för bästa effekten
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {[
                      "skicka i ett DM — inte som vanlig text",
                      "lägg länken som en note i Spotify",
                      "skicka med ett vanligt meddelande precis innan",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
                        <span className="mt-0.5 text-pink-400/70">·</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Create another */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-7 flex items-center justify-center gap-5 text-[13px]"
            >
              <Link
                href="/skapa"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/15 px-5 py-2 text-muted transition-all hover:border-border/30 hover:text-fg"
              >
                skapa en till →
              </Link>
            </motion.div>

            {/* Footer logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-10 flex items-center justify-center gap-1.5 text-[12px] text-muted/35"
            >
              <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
              <span className="font-display italic">hejsot</span>
            </motion.div>
          </motion.div>
        )}

        {/* ── Error ────────────────────────────────────────────── */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm text-center"
          >
            <h2 className="font-display text-2xl font-medium text-fg">
              något gick snett
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              om du betalat — vänta 30 sekunder och ladda om. annars kontakta oss.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full border border-border/20 px-6 py-2.5 text-[14px] text-muted transition-colors hover:border-border/35 hover:text-fg"
            >
              ladda om
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function KlarPage() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-5 py-16"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, #ff7ca1 18%, transparent), transparent 70%)",
      }}
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            >
              <Heart className="h-8 w-8 text-pink-400" />
            </motion.div>
          </div>
        }
      >
        <KlarInner />
      </Suspense>
    </div>
  );
}
