"use client";

import { motion, useReducedMotion } from "framer-motion";

const PIECES = [
  "♡", "♥", "✨", "★", "♡", "🎀", "♥", "✨", "♡", "💗",
  "♡", "✦", "♥", "♡", "🌸", "♡", "✨", "♥",
];

/**
 * En liten konfetti-burst — render renderas bara när `active` är true (vi
 * mount:ar den när hon trycker "ja"). Vi använder bara framer-motion, inga
 * extra paket.
 */
export function Confetti({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
    >
      {PIECES.map((p, i) => {
        const angle = (i / PIECES.length) * Math.PI * 2;
        const distance = 180 + Math.random() * 220;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 40; // bias upward
        const rotate = -180 + Math.random() * 360;
        const delay = Math.random() * 0.1;
        const size = 18 + Math.random() * 22;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x,
              y: [0, y - 30, y],
              scale: [0.6, 1.1, 1],
              rotate,
            }}
            transition={{ duration: 1.4 + Math.random() * 0.4, delay, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 select-none"
            style={{
              fontSize: size,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
          >
            {p}
          </motion.span>
        );
      })}
    </div>
  );
}
