import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/10">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
        <Logo />
        <p className="text-[13px] text-muted">
          Ett vänligare sätt att fråga. Gjord i Sverige.
        </p>
      </div>
    </footer>
  );
}
