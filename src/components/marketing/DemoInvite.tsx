"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A small, looping preview of what an invite feels like — the "wait, this is
 * actually sweet" moment, miniaturised. Calm motion, no gimmicks.
 */
export function DemoInvite() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
    >
      {/* Ambient glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-60 blur-2xl"
        style={{ background: "radial-gradient(60% 60% at 50% 30%, rgba(255,124,161,0.35), transparent 70%)" }}
      />
      <div className="glass overflow-hidden rounded-[2rem] p-7 shadow-lift">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted">en inbjudan till</div>
        <div className="mt-1 font-display text-2xl text-fg">Sara</div>

        <div className="mt-6">
          <div className="font-display text-[1.7rem] leading-tight text-fg">
            Kaffe, du och jag?
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Inget stort. Bara en kopp och en bra pratstund.
          </p>
        </div>

        <div className="mt-7 flex items-center gap-3">
          <motion.div
            initial={{ scale: 1 }}
            animate={reduce ? {} : { scale: [1, 1.04, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex-1 rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-3 text-center text-[15px] font-medium text-[#0d0c11]"
          >
            Ja, gärna
          </motion.div>
          <div className="rounded-full border border-border/15 px-5 py-3 text-[15px] text-muted">
            Kanske
          </div>
        </div>
      </div>
    </motion.div>
  );
}
