import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getUserSession } from "@/lib/auth/user-session";
import { SiteHeaderAuth } from "@/components/marketing/SiteHeaderAuth";

/**
 * Marketing header. Sticky, glass, quiet. Shows a login / dashboard button
 * when the user is (or is not) logged in.
 */
export async function SiteHeader() {
  const session = await getUserSession();

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <SiteHeaderAuth loggedIn={!!session} />
          <ThemeToggle />
        </div>
      </div>
      <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-border/15 to-transparent" />
    </header>
  );
}
