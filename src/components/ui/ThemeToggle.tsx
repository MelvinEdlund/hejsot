"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/** Small, quiet dark/light switch. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Byt till ljust läge" : "Byt till mörkt läge"}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/10 " +
        "bg-surface/60 text-muted backdrop-blur transition-colors hover:text-fg hover:border-border/20 " +
        (className ?? "")
      }
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
