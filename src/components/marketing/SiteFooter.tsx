import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/10">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row">
        <Logo />
        <p className="font-display text-[13px] italic text-muted">
          gjord med ♡ i sverige
        </p>
      </div>
    </footer>
  );
}
