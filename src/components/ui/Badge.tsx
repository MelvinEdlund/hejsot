import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "positive" | "muted";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg/80 border-border/10",
  accent: "bg-accent/12 text-accent border-accent/20",
  positive: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
  muted: "bg-surface-2 text-muted border-border/10",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A quiet kicker / eyebrow label. */
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[12px] uppercase tracking-[0.18em] text-muted", className)}>
      {children}
    </span>
  );
}
