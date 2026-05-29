"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LogOut,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Heart,
  Clock,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { signOut } from "@/actions/user-auth";
import type { Invitation, InviteResponse, AnswerType } from "@/lib/types";

interface InviteWithResponses {
  invitation: Invitation;
  responses: InviteResponse[];
}

interface Props {
  email: string;
  invitations: InviteWithResponses[];
}

const ANSWER_LABEL: Record<
  AnswerType,
  { label: string; emoji: string; color: string }
> = {
  yes: { label: "Ja!", emoji: "🥰", color: "text-green-400" },
  maybe: { label: "Kanske", emoji: "🤔", color: "text-yellow-400" },
  custom: { label: "Eget svar", emoji: "💬", color: "text-accent" },
  no: { label: "Nej", emoji: "😅", color: "text-red-400" },
};

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border/10 bg-surface/60 px-3 py-1.5 text-[12px] text-muted transition hover:text-fg"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Kopierad!" : "Kopiera länk"}
    </button>
  );
}

function InviteCard({ invitation, responses }: InviteWithResponses) {
  const [open, setOpen] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/i/${invitation.slug}`;

  const hasResponses = responses.length > 0;
  const latest = responses[0];
  const answerInfo = latest ? ANSWER_LABEL[latest.answerType] : null;

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-2xl border border-border/10 bg-surface/60"
    >
      {/* Header row */}
      <div
        className="flex cursor-pointer items-center gap-3 px-5 py-4"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Status dot */}
        <div
          className={`h-2 w-2 shrink-0 rounded-full ${
            invitation.status === "active" ? "bg-green-400" : "bg-muted/40"
          }`}
        />

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-fg">
              {invitation.recipientName}
            </span>
            {answerInfo && (
              <span
                className={`shrink-0 text-[12px] font-medium ${answerInfo.color}`}
              >
                {answerInfo.emoji} {answerInfo.label}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[12px] text-muted">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {invitation.openCount} visningar
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {responses.length} svar
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(invitation.createdAt).toLocaleDateString("sv-SE", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <CopyButton url={url} />
          <Link
            href={`/i/${invitation.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/10 bg-surface/60 text-muted transition hover:text-fg"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Responses accordion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/10 px-5 py-4">
              {!hasResponses ? (
                <p className="text-center text-[13px] text-muted py-4">
                  Inga svar ännu — hon kanske håller på att bestämma sig 🤔
                </p>
              ) : (
                <div className="space-y-3">
                  {responses.map((r) => {
                    const info = ANSWER_LABEL[r.answerType];
                    return (
                      <div
                        key={r.id}
                        className="rounded-xl border border-border/10 bg-surface/40 p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[13px] font-medium ${info.color}`}
                          >
                            {info.emoji} {info.label}
                          </span>
                          <span className="text-[11px] text-muted">
                            {new Date(r.createdAt).toLocaleString("sv-SE", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {r.answer && (
                          <p className="mt-2 text-[14px] text-fg leading-relaxed">
                            {r.answer}
                          </p>
                        )}
                        {r.timing && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted">
                            <Clock className="h-3 w-3" />
                            {r.timing}
                          </p>
                        )}
                        {r.note && (
                          <p className="mt-1.5 text-[12px] text-muted italic">
                            {r.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function UserDashboard({ email, invitations }: Props) {
  const router = useRouter();
  const [, start] = useTransition();

  function handleSignOut() {
    start(async () => {
      await signOut();
      router.replace("/");
      router.refresh();
    });
  }

  const total = invitations.length;
  const viewed = invitations.filter((i) => i.invitation.openCount > 0).length;
  const responded = invitations.filter((i) => i.responses.length > 0).length;
  const yeses = invitations.filter((i) =>
    i.responses.some((r) => r.answerType === "yes"),
  ).length;

  const stats = [
    { label: "Skickade", value: total, emoji: "💌" },
    { label: "Sedda", value: viewed, emoji: "👀" },
    { label: "Svarade", value: responded, emoji: "💬" },
    { label: "Ja!", value: yeses, emoji: "🥰" },
  ];

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/10 bg-bg/70 backdrop-blur">
        <div className="mx-auto flex max-w-content items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Logo href="/" />
            <span className="hidden text-[12px] uppercase tracking-[0.18em] text-muted sm:inline">
              min studio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/skapa"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 text-[14px] font-medium text-[#0d0c11] transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              Ny inbjudan
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Logga ut"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/10 bg-surface/60 text-muted transition-colors hover:text-fg"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-5 py-8">
        {/* Greeting */}
        <div className="mb-7">
          <h1 className="font-display text-3xl font-medium text-fg">
            Hej <span className="text-gradient">{email.split("@")[0]}</span> 👋
          </h1>
          <p className="mt-1 text-[14px] text-muted">
            Alla dina inbjudningar och svar på ett ställe.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/10 bg-surface/50 p-5"
            >
              <div className="font-display text-3xl text-fg">
                {s.emoji} {s.value}
              </div>
              <div className="mt-1 text-[13px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Invites list */}
        <div className="mt-8">
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/10 bg-surface/30 py-16 text-center">
              <div className="mb-4 text-5xl">💌</div>
              <h2 className="font-display text-xl text-fg">
                Inga inbjudningar ännu
              </h2>
              <p className="mt-2 text-[14px] text-muted">
                Skapa din första och dela den — hon ska säga ja.
              </p>
              <Link
                href="/skapa"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-[14px] font-medium text-[#0d0c11] transition hover:brightness-105"
              >
                <Heart className="h-4 w-4" />
                Skapa en inbjudan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="mb-4 text-[13px] uppercase tracking-widest text-muted">
                Dina inbjudningar
              </h2>
              {invitations.map(({ invitation, responses }) => (
                <InviteCard
                  key={invitation.id}
                  invitation={invitation}
                  responses={responses}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
