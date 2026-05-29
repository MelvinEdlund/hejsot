"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * RunawayNo — nej-knapp som flyr snabbare och längre för varje försök.
 * Den går aldrig att klicka.
 */
export function RunawayNo({
  onDodge,
  className = "",
}: {
  onDodge?: (count: number) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dodges, setDodges] = useState(0);

  // Eskalerande etiketter
  const labels = [
    "nej",
    "nej 😶",
    "nope",
    "nei nei",
    "nej!!",
    "stopp",
    "INTE",
    "🏃",
  ];
  const label = labels[Math.min(dodges, labels.length - 1)];

  function hop() {
    if (reduce) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w = wrap.clientWidth;
    // Varje dodge: längre och snabbare
    const xRange = Math.min(w * 0.88, 70 + dodges * 38);
    const yRange = Math.min(90, 20 + dodges * 14);
    const x = Math.round((Math.random() * 2 - 1) * xRange);
    const y = Math.round((Math.random() * 2 - 1) * yRange);
    setPos({ x, y });
    setDodges((d) => {
      const next = d + 1;
      onDodge?.(next);
      return next;
    });
  }

  function handleClick() {
    hop();
  }

  return (
    <div ref={wrapRef} className={"relative flex justify-center " + className}>
      <motion.button
        type="button"
        onMouseEnter={hop}
        onMouseDown={hop}
        onPointerDown={hop}
        onFocus={hop}
        onTouchStart={hop}
        onClick={handleClick}
        animate={{
          x: pos.x,
          y: pos.y,
          rotate: [0, -8, 8, -6, 6, -4, 4, 0],
        }}
        transition={{
          type: "spring",
          stiffness: Math.min(900, 280 + dodges * 90),
          damping: Math.max(10, 18 - dodges),
          rotate: { duration: 0.4, ease: "easeOut" },
        }}
        className="rounded-full border border-border/20 bg-surface/40 px-5 py-2.5 text-[14px] text-muted/80 backdrop-blur transition-colors hover:text-fg"
        aria-label="Nej"
      >
        {label}
      </motion.button>
    </div>
  );
}
