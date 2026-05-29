"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";

/**
 * Liten loopande förhandsvisning av hur en invite känns. Polaroid, doodly
 * stickers, tiltade element — den hemmagjorda känslan, miniatyriserad.
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
      {/* Ambient glow bakom kortet */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 30%, rgba(255,124,161,0.35), transparent 70%)",
        }}
      />

      {/* Doodle-stickers utanför kortet */}
      <span aria-hidden className="absolute -left-2 top-4 -rotate-12 text-2xl">
        ♡
      </span>
      <span aria-hidden className="absolute -right-3 top-10 rotate-12 text-xl">
        ✨
      </span>
      <span aria-hidden className="absolute -bottom-2 left-6 -rotate-6 text-xl">
        🌸
      </span>

      <div className="glass relative overflow-hidden rounded-[2rem] p-6 shadow-lift">
        <div className="flex items-center gap-1.5 text-fg/70">
          <Heart className="h-3 w-3 fill-current text-accent" strokeWidth={0} />
          <span className="font-display text-[12px] italic">från melvin</span>
        </div>

        <div className="font-display text-[12px] italic text-muted">till</div>
        <div className="font-display text-2xl text-fg">Sofia</div>

        {/* Tiltad polaroid */}
        <div className="mt-4 flex justify-center">
          <motion.div
            initial={{ rotate: -4 }}
            animate={reduce ? {} : { rotate: [-4, -2.5, -4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white p-2 pb-5"
            style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.22))" }}
          >
            <span
              aria-hidden
              className="absolute -top-1.5 left-3 h-3 w-8 -rotate-12 bg-[rgba(255,255,200,0.7)] mix-blend-multiply"
            />
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTg1YjkxOG9ybWNmMjZ1bG14NWVzNDZqOWJlcjI4dDV2czdlcHExaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KmxmoHUGPDjfQXqGgv/giphy.gif"
              alt="Romantisk gif"
              className="h-24 w-24 object-cover sm:h-28 sm:w-28"
            />
            <div className="absolute inset-x-0 bottom-1 text-center font-display text-[10px] italic text-black/70">
              literally us
            </div>
          </motion.div>
        </div>

        <div className="mt-5">
          <div className="font-display text-[1.5rem] leading-tight text-fg">
            fika?
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-fg/80">
            har du tid nån dag?
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <motion.div
            initial={{ scale: 1 }}
            animate={reduce ? {} : { scale: [1, 1.03, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full rounded-full bg-gradient-to-r from-accent to-accent-2 px-5 py-3 text-center text-[15px] font-medium text-[#0d0c11]"
          >
            ja ♡
          </motion.div>
          <div className="mx-auto w-fit rounded-full border border-border/15 px-5 py-3 text-center text-[15px] text-muted">
            nej tack
          </div>
        </div>
      </div>
    </motion.div>
  );
}
