"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/actions/user-auth";

interface Props {
  loggedIn: boolean;
}

export function SiteHeaderAuth({ loggedIn }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSignOut() {
    start(async () => {
      await signOut();
      router.refresh();
    });
  }

  if (!loggedIn) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/studio"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/10 bg-surface/60 px-4 text-[14px] text-muted transition hover:text-fg"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">Mitt studio</span>
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        aria-label="Logga ut"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/10 bg-surface/60 text-muted transition-colors hover:text-fg disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
