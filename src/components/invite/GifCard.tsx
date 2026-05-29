"use client";

/**
 * GifCard — en söt, lätt snedvriden kortkomponent för att visa
 * animerade GIFs / memes i invite-upplevelsen.
 *
 * Liknar Polaroid-kortet i känsla men har en mjuk shadow-glow och
 * en liten "wibble"-animation vid hover.
 */

import { motion, useReducedMotion } from "framer-motion";

interface GifCardProps {
  src: string;
  caption?: string;
  tilt?: number; // grader, default 2
}

export function GifCard({ src, caption, tilt = 2 }: GifCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: reduce ? 0 : tilt - 1 }}
      animate={{ opacity: 1, y: 0, rotate: reduce ? 0 : tilt }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : {
        rotate: tilt * -0.6,
        scale: 1.025,
        transition: { duration: 0.3 },
      }}
      className="mx-auto inline-block"
      style={{ transformOrigin: "center bottom" }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/80 shadow-[0_4px_32px_rgba(0,0,0,0.28)]"
        style={{
          padding: "8px 8px 4px",
        }}
      >
        {/* Gif itself */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption ?? "gif"}
          className="block max-h-64 w-full rounded-xl object-cover"
          loading="lazy"
          style={{ maxWidth: "320px" }}
        />

        {/* Caption */}
        {caption && (
          <div className="mt-1.5 pb-1 text-center font-display text-[12px] italic leading-snug text-muted/80">
            {caption}
          </div>
        )}
      </div>
    </motion.div>
  );
}
