"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { StickerPack } from "@/lib/types";

/**
 * Söta, sticker-aktiga emojis som svävar runt i bakgrunden. Tanken är att
 * sidan ska kännas hemmagjord — som om personen själv pillat ihop den med
 * hjärta. Användaren väljer en "sticker pack" och vi sprider de runt.
 */

export const STICKER_PACK_CHOICES: {
  id: StickerPack;
  label: string;
  preview: string;
  emojis: string[];
}[] = [
  { id: "mixed",     label: "blandat",   preview: "♡✨🌸", emojis: ["♡", "✨", "🌸", "🐱", "🍓", "💌", "★", "🤍"] },
  { id: "hearts",    label: "hjärtan",   preview: "♡♥💗",  emojis: ["♡", "♥", "💗", "💞", "💌", "💖", "❣️", "🤍"] },
  { id: "cats",      label: "katter",    preview: "🐱😻🐾", emojis: ["🐱", "😻", "🐾", "♡", "✨", "🌸", "🥹", "🎀"] },
  { id: "flowers",   label: "blommor",   preview: "🌹🌸🌷", emojis: ["🌹", "🌸", "🌷", "🌻", "🌺", "💐", "🌿", "♡"] },
  { id: "food",      label: "mat",       preview: "🍓🍰☕",  emojis: ["🍓", "🍰", "☕", "🍷", "🥐", "🍝", "🍕", "♡"] },
  { id: "sparkles",  label: "glitter",   preview: "✨💫⭐",  emojis: ["✨", "💫", "⭐", "🌟", "✦", "♡", "·", "★"] },
  { id: "doodle",    label: "doodle",    preview: "♡★✿",   emojis: ["♡", "★", "✿", "✦", "♪", "♫", "✧", "·"] },
];

const PACK_MAP: Record<StickerPack, string[]> = Object.fromEntries(
  STICKER_PACK_CHOICES.map((p) => [p.id, p.emojis]),
) as Record<StickerPack, string[]>;

type Spec = {
  emoji: string;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  drift: number;
};

// Stable pseudo-random positions per (pack, slug) so the layout doesn't
// rejiggle on every render but still feels handmade per invite.
function specsFor(pack: StickerPack, seed: string): Spec[] {
  const set = PACK_MAP[pack] ?? PACK_MAP.mixed;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  return Array.from({ length: 12 }, (_, i) => ({
    emoji: set[i % set.length]!,
    left: `${3 + rand() * 94}%`,
    top: `${4 + rand() * 90}%`,
    size: 16 + Math.floor(rand() * 32),
    delay: rand() * 3,
    duration: 6 + rand() * 7,
    rotate: -22 + rand() * 44,
    drift: 6 + rand() * 18,
  }));
}

export function Decorations({
  pack,
  seed,
}: {
  pack: StickerPack;
  seed: string;
}) {
  const reduce = useReducedMotion();
  const specs = specsFor(pack, seed);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1] select-none overflow-hidden"
    >
      {specs.map((s, i) => (
        <motion.span
          key={i}
          className="absolute opacity-60 dark:opacity-50"
          style={{
            left: s.left,
            top: s.top,
            fontSize: s.size,
            filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.18))",
          }}
          initial={{ opacity: 0, y: 6, rotate: s.rotate }}
          animate={
            reduce
              ? { opacity: 0.5 }
              : {
                  opacity: [0.0, 0.7, 0.5, 0.7],
                  y: [0, -s.drift, 0, -s.drift / 1.5, 0],
                  rotate: [s.rotate, s.rotate + 8, s.rotate - 5, s.rotate],
                }
          }
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {s.emoji}
        </motion.span>
      ))}

      {/* Handritade detaljer */}
      <svg
        className="absolute left-4 top-6 h-10 w-10 text-fg/20"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M16 26 C 4 18, 6 8, 12 8 C 14 8, 16 10, 16 12 C 16 10, 18 8, 20 8 C 26 8, 28 18, 16 26 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="absolute bottom-6 right-5 h-12 w-12 text-fg/15"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M6 12 Q 12 4, 16 12 Q 20 4, 26 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="10" cy="20" r="1.5" fill="currentColor" />
        <circle cx="22" cy="20" r="1.5" fill="currentColor" />
      </svg>
      {/* Stjärnor */}
      <svg
        className="absolute right-8 top-16 h-6 w-6 text-fg/20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.8 6.8L20 10l-6 4.5L16 22l-6-4.5L4 22l2-7.5L0 10l6.2-1.2L12 2z" transform="scale(0.6) translate(8 8)" />
      </svg>
    </div>
  );
}
