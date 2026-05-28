"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink, Send, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { updateInvitation } from "@/actions/invitations";
import type { InviteStatus } from "@/lib/types";

export function InviteDetailActions({
  id,
  url,
  status,
  canResend,
}: {
  id: string;
  url: string;
  status: InviteStatus;
  canResend: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [resent, setResent] = useState(false);
  const [pending, start] = useTransition();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function run(action: "archive" | "activate" | "delete" | "resend") {
    if (action === "delete" && !window.confirm("Ta bort inbjudan permanent?")) return;
    start(async () => {
      const res = await updateInvitation({ id, action });
      if (action === "delete" && res.ok) {
        router.push("/studio");
        return;
      }
      if (action === "resend" && res.ok) {
        setResent(true);
        setTimeout(() => setResent(false), 2000);
        return;
      }
      router.refresh();
    });
  }

  const btn =
    "inline-flex h-10 items-center gap-1.5 rounded-full border border-border/15 bg-surface/60 px-4 text-[14px] text-fg transition-colors hover:border-border/30 disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={copy} className={btn}>
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        {copied ? "Kopierad" : "Kopiera länk"}
      </button>
      <a href={url} target="_blank" rel="noreferrer" className={btn}>
        <ExternalLink className="h-4 w-4" /> Öppna
      </a>
      {canResend && (
        <button onClick={() => run("resend")} disabled={pending} className={btn}>
          <Send className="h-4 w-4" /> {resent ? "Skickat" : "Skicka notis igen"}
        </button>
      )}
      {status === "archived" ? (
        <button onClick={() => run("activate")} disabled={pending} className={btn}>
          <ArchiveRestore className="h-4 w-4" /> Återställ
        </button>
      ) : (
        <button onClick={() => run("archive")} disabled={pending} className={btn}>
          <Archive className="h-4 w-4" /> Arkivera
        </button>
      )}
      <button
        onClick={() => run("delete")}
        disabled={pending}
        className={btn + " hover:!border-red-500/40 hover:!text-red-400"}
      >
        <Trash2 className="h-4 w-4" /> Ta bort
      </button>
    </div>
  );
}
