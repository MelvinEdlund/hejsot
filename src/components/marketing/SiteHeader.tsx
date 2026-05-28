import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Marketing header. Sticky, glass, quiet. No nav clutter — just the mark,
 * a theme switch, and a single quiet entry point to the studio.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-border/15 to-transparent" />
    </header>
  );
}
