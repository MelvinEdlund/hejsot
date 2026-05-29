"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Tiltad polaroid med "tejp" i hörnen och en handskriven caption. Visas på
 * invite-sidan när killen laddat upp en bild. Lite hover-wobble för charm.
 */
export function Polaroid({
  src,
  caption,
  tilt = -3,
  className = "",
}: {
  src: string;
  caption?: string | null;
  tilt?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: tilt + 4, y: 12 }}
      animate={{ opacity: 1, rotate: tilt, y: 0 }}
      whileHover={reduce ? undefined : { rotate: tilt + 1, y: -2 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={"relative mx-auto w-fit max-w-[260px] " + className}
      style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.28))" }}
    >
      <div className="relative bg-white p-3 pb-10">
        {/* Tejp i två hörn */}
        <span
          aria-hidden
          className="absolute -top-2 left-3 h-4 w-12 -rotate-12 bg-[rgba(255,255,200,0.7)] mix-blend-multiply"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
        />
        <span
          aria-hidden
          className="absolute -top-2 right-3 h-4 w-10 rotate-[14deg] bg-[rgba(255,255,200,0.7)] mix-blend-multiply"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="bild"
          className="block h-[220px] w-[220px] object-cover sm:h-[240px] sm:w-[240px]"
        />
        {caption && (
          <div className="absolute inset-x-0 bottom-2 px-3 text-center font-display text-[14px] italic text-black/75">
            {caption}
          </div>
        )}
      </div>
    </motion.div>
  );
}
