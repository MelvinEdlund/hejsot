import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/10">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] text-muted/60">
          <Link href="/anvandarvillkor" className="transition-colors hover:text-muted">
            Användarvillkor
          </Link>
          <Link href="/integritetspolicy" className="transition-colors hover:text-muted">
            Integritetspolicy
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-muted">
            Cookies
          </Link>
          <a href="mailto:hej@hejsot.lol" className="transition-colors hover:text-muted">
            hej@hejsot.lol
          </a>
        </nav>
        <p className="text-[11px] text-muted/40">© 2025 HejSöt</p>
      </div>
    </footer>
  );
}
