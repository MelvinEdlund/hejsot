"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Copy, ExternalLink, Heart, Sparkles, Link as LinkIcon
} from "lucide-react";
import Link from "next/link";

type State = "loading" | "ready" | "error";

function KlarInner() {
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const sessionId = params.get("session_id") ?? "";

  const [state, setState] = useState<State>("loading");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) { setState("error"); return; }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let attempt = 0;

    async function poll() {
      if (cancelled) return;
      try {
        const qs = new URLSearchParams({ slug });
        if (sessionId) qs.set("session_id", sessionId);
        const res = await fetch(`/api/verify-payment?${qs}`);
        const data = await res.json() as { unlocked?: boolean; url?: string };
        if (data.unlocked && data.url) {
          setInviteUrl(data.url);
          setState("ready");
          return;
        }
      } catch { /* retry */ }
      attempt++;
      if (attempt >= 15) { setState("error"); return; }
      const delay = Math.min(1000 * (1 + Math.floor(attempt / 2)), 4000);
      timeoutId = setTimeout(poll, delay);
    }

    void poll();
    return () => { cancelled = true; clearTimeout(timeoutId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, sessionId]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <AnimatePresence mode="wait">
      {state === "loading" && (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          </div>
          <h2 className="mt-6 font-display text-2xl font-medium text-fg">låser upp din inbjudan...</h2>
          <p className="mt-2 text-muted">ett ögonblick</p>
        </motion.div>
      )}
      {state === "ready" && (
        <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white">
            <Check className="h-8 w-8" strokeWidth={2.5} />
          </motion.div>
          <h1 className="mt-6 font-display text-3xl font-medium text-fg">inbjudan upplast! ♡</h1>
          <p className="mt-2 text-[15px] text-muted">kopiera lanken och skicka den till henne nu</p>
          <div className="mt-7 flex items-center gap-2 rounded-full border border-border/15 bg-surface/60 p-1.5 pl-5">
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-muted/60" />
            <span className="min-w-0 flex-1 truncate text-left text-[13px] text-muted">{inviteUrl}</span>
            <button onClick={copy} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 px-4 text-[13px] font-medium text-white transition-all hover:brightness-110">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "kopierad!" : "kopiera"}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-5 text-[14px]">
            <a href={inviteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-fg/70 transition-colors hover:text-fg">
              <ExternalLink className="h-4 w-4" /> oppna och forhandsgranska
            </a>
            <Link href="/skapa" className="text-muted transition-colors hover:text-fg">skapa en till</Link>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 rounded-2xl border border-border/10 bg-surface/40 px-5 py-4">
            <div className="flex items-start gap-3 text-left">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pink-400" />
              <div>
                <p className="text-[13px] font-medium text-fg">tips</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">skicka lanken pa ett ovanligt stalle — i ett DM, som en note i Spotify, eller gommd i ett vanligt meddelande.</p>
              </div>
            </div>
          </motion.div>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-muted/40">
            <Heart className="h-3 w-3 fill-current" strokeWidth={0} />
            <span className="font-display italic">hejsot</span>
          </div>
        </motion.div>
      )}
      {state === "error" && (
        <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <h2 className="font-display text-2xl font-medium text-fg">nagot gick snett</h2>
          <p className="mt-3 text-[15px] text-muted">om du betalat — vantat 30 sekunder och ladda om. annars kontakta oss.</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-full border border-border/20 px-6 py-2.5 text-[14px] text-muted transition-colors hover:text-fg">ladda om</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function KlarPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-5">
      <Suspense fallback={
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface">
          <svg className="h-8 w-8 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
        </div>
      }>
        <KlarInner />
      </Suspense>
    </div>
  );
}
