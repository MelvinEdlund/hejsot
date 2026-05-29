"use client";

/**
 * SpotifyPlayer — snygg inbäddad musikspelare i invite-storyn.
 * Använder Spotify standard embed iframe med autoplay=1.
 * Animerade musikstavar + gullig gradient-kort design.
 */

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Hjälpfunktioner ────────────────────────────────────────────────

function extractSpotifyEmbed(url: string, autoplay: boolean): string | null {
  if (url.startsWith("spotify:")) {
    const parts = url.split(":");
    if (parts.length >= 3) {
      return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}?utm_source=generator&theme=0&autoplay=${autoplay ? 1 : 0}`;
    }
  }
  try {
    const u = new URL(url);
    if (u.hostname === "open.spotify.com" && u.pathname.startsWith("/")) {
      const clean = u.pathname.replace(/^\/intl-[a-z]+\//, "/");
      return `https://open.spotify.com/embed${clean}?utm_source=generator&theme=0&autoplay=${autoplay ? 1 : 0}`;
    }
  } catch {
    /* inte en URL */
  }
  return null;
}

// ── Animated music bars ────────────────────────────────────────────

function MusicBars({ accentFrom }: { accentFrom: string }) {
  const heights = [4, 9, 6, 12, 5, 10, 7];
  return (
    <div className="flex items-end gap-[2px]" aria-hidden>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: `${h}px`,
            background: `color-mix(in srgb, ${accentFrom} 70%, transparent)`,
            animation: `musicbar 0.7s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────

interface SpotifyPlayerProps {
  url: string;
  label?: string;
  accentFrom: string;
  accentTo: string;
  autoPlay?: boolean;
}

// ── Komponent ──────────────────────────────────────────────────────

export function SpotifyPlayer({
  url,
  label,
  accentFrom,
  accentTo,
  autoPlay = true,
}: SpotifyPlayerProps) {
  const embedUrl = extractSpotifyEmbed(url, autoPlay);

  // Fallback för icke-Spotify-URLer
  if (!embedUrl) {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="group flex items-center gap-3 rounded-2xl border border-border/15 bg-surface/60 px-4 py-3.5 backdrop-blur-sm transition-colors hover:border-accent/30"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm text-[#0d0c11]"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          ♫
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-fg">{label || "musik"}</div>
          <div className="text-[12px] text-muted">tryck för att lyssna</div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted/60 transition-colors group-hover:text-fg" />
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.65, ease }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${accentFrom} 14%, var(--surface, #1a1a2e)), color-mix(in srgb, ${accentTo} 9%, var(--surface, #1a1a2e)))`,
        border: `1px solid color-mix(in srgb, ${accentFrom} 22%, transparent)`,
        boxShadow: `0 6px 32px color-mix(in srgb, ${accentFrom} 18%, transparent), 0 2px 8px rgb(0 0 0 / 0.22)`,
      }}
    >
      {/* Gradient top accent stripe */}
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo}, ${accentFrom})` }}
      />

      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pb-2.5 pt-3">
        {/* Vinyl/note icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] text-[#0d0c11] shadow-md"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          ♫
        </motion.div>

        {/* Labels */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-fg leading-tight">
            {label || "en låt till dig"}
          </div>
          <div className="text-[11px] italic text-muted/70 leading-tight mt-0.5">
            🎵 spelar nu…
          </div>
        </div>

        {/* Animated bars */}
        <MusicBars accentFrom={accentFrom} />
      </div>

      {/* Spotify iframe */}
      <div className="px-3 pb-3">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.06), 0 2px 12px rgb(0 0 0 / 0.3)`,
          }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading={autoPlay ? "eager" : "lazy"}
            title={label || "musik"}
            className="block"
            style={{ borderRadius: "16px", display: "block" }}
          />
        </div>
      </div>

      {/* Subtle corner hearts */}
      <div
        className="pointer-events-none absolute right-3 top-3 text-[10px] opacity-20 select-none"
        style={{ color: accentTo }}
        aria-hidden
      >
        ♡
      </div>
    </motion.div>
  );
}
