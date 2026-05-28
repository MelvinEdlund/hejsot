"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/actions/auth";

export function StudioHeader({ showNew = true }: { showNew?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function signOut() {
    start(async () => {
      await logout();
      router.replace("/studio/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/10 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Logo href="/studio" />
          <span className="hidden text-[12px] uppercase tracking-[0.18em] text-muted sm:inline">
            studio
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showNew && (
            <Link
              href="/studio/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 text-[14px] font-medium text-[#0d0c11] transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Ny inbjudan
            </Link>
          )}
          <ThemeToggle />
          <button
            onClick={signOut}
            disabled={pending}
            aria-label="Logga ut"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/10 bg-surface/60 text-muted transition-colors hover:text-fg disabled:opacity-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
