"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Trash2,
  Eye,
  MessageCircleHeart,
} from "lucide-react";
import type { Invitation } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { inviteUrl, timeAgo, cn } from "@/lib/utils";
import { updateInvitation } from "@/actions/invitations";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import { Badge } from "@/components/ui/Badge";

type Filter = "all" | "active" | "responded" | "archived";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Alla" },
  { id: "active", label: "Aktiva" },
  { id: "responded", label: "Svarade" },
  { id: "archived", label: "Arkiverade" },
];

export function InviteTable({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invitations.filter((i) => {
      if (filter === "active" && i.status !== "active") return false;
      if (filter === "archived" && i.status !== "archived") return false;
      if (filter === "responded" && !(i.responseCount && i.responseCount > 0)) return false;
      if (!q) return true;
      return (
        i.recipientName.toLowerCase().includes(q) ||
        i.headline.toLowerCase().includes(q) ||
        i.slug.toLowerCase().includes(q)
      );
    });
  }, [invitations, query, filter]);

  async function copy(slug: string, id: string) {
    try {
      await navigator.clipboard.writeText(inviteUrl(slug));
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  function act(id: string, action: "archive" | "activate" | "delete") {
    if (action === "delete" && !window.confirm("Ta bort inbjudan permanent? Detta går inte att ångra.")) {
      return;
    }
    setBusyId(id);
    startTransition(async () => {
      await updateInvitation({ id, action });
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök namn, rubrik eller länk…"
            className="w-full rounded-full border border-border/15 bg-surface/60 py-2.5 pl-10 pr-4 text-[14px] text-fg placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                filter === f.id ? "bg-fg/10 text-fg" : "text-muted hover:text-fg",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-border/10">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted">Inga inbjudningar här ännu.</div>
        ) : (
          rows.map((i, idx) => {
            const t = getTemplate(i.template);
            const responded = (i.responseCount ?? 0) > 0;
            const viewed = i.openCount > 0;
            return (
              <div
                key={i.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface/40 sm:px-5",
                  idx > 0 && "border-t border-border/10",
                  busyId === i.id && "opacity-50",
                )}
              >
                <div
                  className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#0d0c11] sm:flex"
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                >
                  <TemplateIcon name={t.icon} className="h-[18px] w-[18px]" />
                </div>

                <Link href={`/studio/invite/${i.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-fg">{i.recipientName}</span>
                    {i.status === "archived" ? (
                      <Badge tone="muted">Arkiverad</Badge>
                    ) : responded ? (
                      <Badge tone="positive">
                        <MessageCircleHeart className="h-3 w-3" /> Svarat
                      </Badge>
                    ) : viewed ? (
                      <Badge tone="accent">
                        <Eye className="h-3 w-3" /> Sett
                      </Badge>
                    ) : (
                      <Badge tone="muted">Väntar</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-muted">
                    {t.label} · {timeAgo(i.createdAt)}
                    {viewed ? ` · ${i.openCount} öppning${i.openCount === 1 ? "" : "ar"}` : ""}
                  </div>
                </Link>

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label="Kopiera länk"
                    onClick={() => copy(i.slug, i.id)}
                  >
                    {copiedId === i.id ? (
                      <Check className="h-[17px] w-[17px] text-emerald-400" />
                    ) : (
                      <Copy className="h-[17px] w-[17px]" />
                    )}
                  </IconButton>
                  <a
                    href={inviteUrl(i.slug)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Öppna inbjudan"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
                  >
                    <ExternalLink className="h-[17px] w-[17px]" />
                  </a>
                  {i.status === "archived" ? (
                    <IconButton label="Återställ" onClick={() => act(i.id, "activate")}>
                      <ArchiveRestore className="h-[17px] w-[17px]" />
                    </IconButton>
                  ) : (
                    <IconButton label="Arkivera" onClick={() => act(i.id, "archive")}>
                      <Archive className="h-[17px] w-[17px]" />
                    </IconButton>
                  )}
                  <IconButton label="Ta bort" onClick={() => act(i.id, "delete")} danger>
                    <Trash2 className="h-[17px] w-[17px]" />
                  </IconButton>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface",
        danger ? "hover:text-red-400" : "hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
