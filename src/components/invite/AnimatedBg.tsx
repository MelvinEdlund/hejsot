"use client";

import { useMemo } from "react";
import type { BgTheme } from "@/lib/types";

type Particle = {
  id: number;
  x: number;   // left %
  y: number;   // top % (starting position)
  size: number;
  delay: number;
  dur: number;
  char: string;
  opacity: number;
  anim: string;
};

/** Deterministic seeded RNG so SSR and client agree. */
function makeRng(seed: string) {
  let s = seed.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0x811c9dc5);
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
}

const THEME_CONFIG: Record<
  Exclude<BgTheme, "none" | "aurora">,
  { chars: string[]; count: number; anim: string; minSize: number; maxSize: number }
> = {
  starfield: {
    chars: ["✦", "✧", "·", "★", "⋆", "∗"],
    count: 45,
    anim: "twinkle",
    minSize: 8,
    maxSize: 20,
  },
  bubbles: {
    chars: ["○", "◯", "⬤"],
    count: 22,
    anim: "bubble-rise",
    minSize: 10,
    maxSize: 30,
  },
  roses: {
    chars: ["🌹", "🌸", "🌺", "🌷", "🌼"],
    count: 18,
    anim: "sway-up",
    minSize: 14,
    maxSize: 24,
  },
  heartbeat: {
    chars: ["♡", "♥", "❤", "💗", "💕"],
    count: 28,
    anim: "heart-float",
    minSize: 12,
    maxSize: 26,
  },
  snow: {
    chars: ["❄", "❅", "❆", "·", "∗"],
    count: 35,
    anim: "snowfall",
    minSize: 8,
    maxSize: 18,
  },
};

function makeParticles(theme: Exclude<BgTheme, "none" | "aurora">, seed: string): Particle[] {
  const cfg = THEME_CONFIG[theme];
  const rng = makeRng(seed + theme);
  return Array.from({ length: cfg.count }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: theme === "snow" ? -(rng() * 20) : 90 + rng() * 20, // snow starts above, others rise from bottom
    size: cfg.minSize + rng() * (cfg.maxSize - cfg.minSize),
    delay: -(rng() * 12), // negative = already mid-animation on load
    dur: 5 + rng() * 10,
    char: cfg.chars[Math.floor(rng() * cfg.chars.length)]!,
    opacity: 0.12 + rng() * 0.28,
    anim: cfg.anim,
  }));
}

export function AnimatedBg({ theme, seed = "preview" }: { theme: BgTheme; seed?: string }) {
  const particles = useMemo(() => {
    if (theme === "none" || theme === "aurora") return [];
    return makeParticles(theme, seed);
  }, [theme, seed]);

  if (theme === "none") return null;

  if (theme === "aurora") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60"
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #ff7ca1, #b28aff, #7cd4ff, #b28aff, #ff7ca1)",
            backgroundSize: "400% 400%",
            animation: "aurora-flow 10s ease infinite",
            opacity: 0.35,
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            opacity: p.opacity,
            animation: `${p.anim} ${p.dur}s ${p.delay}s linear infinite`,
            ["--p-op" as string]: p.opacity,
            userSelect: "none",
            lineHeight: 1,
            // bubbles get a nice color tint
            color:
              theme === "bubbles"
                ? ["rgba(255,124,161,0.7)", "rgba(178,138,255,0.7)", "rgba(255,255,255,0.5)"][
                    p.id % 3
                  ]
                : undefined,
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

/** Mini animated preview card for the theme picker in the form. */
export function BgThemePreview({ theme, active }: { theme: BgTheme; active: boolean }) {
  const labels: Record<BgTheme, string> = {
    none: "standard",
    starfield: "stjärnhimmel",
    bubbles: "bubblor",
    aurora: "aurora",
    roses: "blommor",
    heartbeat: "hjärtan",
    snow: "snö",
  };
  const emojis: Record<BgTheme, string> = {
    none: "✦",
    starfield: "✦ ✧ ★",
    bubbles: "○ ◯ ⬤",
    aurora: "🌌",
    roses: "🌹 🌸 🌷",
    heartbeat: "♡ ♥ 💗",
    snow: "❄ ❅ ❆",
  };
  const colors: Record<BgTheme, string> = {
    none: "from-surface/80 to-surface/40",
    starfield: "from-[#ece9f7] to-[#ddd6f3] dark:from-[#0d0c17] dark:to-[#1a1030]",
    bubbles:   "from-[#ead6f7] to-[#d6eaf7] dark:from-[#1a0d2e] dark:to-[#0d1a2e]",
    aurora:    "from-[#ff7ca1]/20 via-[#b28aff]/20 to-[#7cd4ff]/20",
    roses:     "from-[#f7d6e6] to-[#f7d6d6] dark:from-[#2e0d1a] dark:to-[#1a0d0d]",
    heartbeat: "from-[#f7d6e6] to-[#f0d6f7] dark:from-[#2e0d1a] dark:to-[#1a0d20]",
    snow:      "from-[#d6e8f7] to-[#d6d6f0] dark:from-[#0d1a2e] dark:to-[#0d1020]",
  };

  const isDarkCard = theme !== "none" && theme !== "aurora";

  return (
    <button
      type="button"
      className={[
        "relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border px-1 py-3 transition-all",
        "bg-gradient-to-br",
        colors[theme],
        active
          ? "border-transparent ring-2 ring-accent/70 scale-[1.03]"
          : isDarkCard
            ? "border-white/10 hover:border-white/25"
            : "border-border/15 hover:border-border/30",
      ].join(" ")}
    >
      <span className="text-[16px] leading-none">{emojis[theme]}</span>
      <span
        className={[
          "w-full text-center text-[10px] leading-tight",
          isDarkCard ? "text-fg/60 dark:text-white/70" : "text-fg/70",
        ].join(" ")}
      >
        {labels[theme]}
      </span>
    </button>
  );
}
