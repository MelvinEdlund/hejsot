import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageCircleHeart, Clock } from "lucide-react";
import { getInvitationDetail } from "@/lib/queries";
import { getTemplate } from "@/lib/templates";
import { inviteUrl, formatDateTime, timeAgo } from "@/lib/utils";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { InviteDetailActions } from "@/components/studio/InviteDetailActions";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import { Badge } from "@/components/ui/Badge";

const ANSWER_LABEL: Record<string, { text: string; tone: "positive" | "accent" | "muted" }> = {
  yes: { text: "Ja", tone: "positive" },
  maybe: { text: "Kanske", tone: "accent" },
  custom: { text: "Eget svar", tone: "muted" },
  no: { text: "Nej", tone: "muted" },
};

export default async function InviteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getInvitationDetail(id);
  if (!detail) notFound();
  const { invitation: i, responses } = detail;
  const t = getTemplate(i.template);
  const url = inviteUrl(i.slug);

  const stats = [
    { label: "Öppningar", value: i.openCount, icon: Eye },
    { label: "Svar", value: responses.length, icon: MessageCircleHeart },
    { label: "Skapad", value: timeAgo(i.createdAt), icon: Clock },
  ];

  return (
    <>
      <StudioHeader />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/studio"
          className="inline-flex items-center gap-1.5 text-[14px] text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" /> Översikt
        </Link>

        {/* Header card */}
        <div className="mt-5 overflow-hidden rounded-3xl border border-border/10">
          <div
            className="relative px-6 py-7"
            style={{ background: `linear-gradient(120deg, ${t.from}22, ${t.to}1a)` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#0d0c11]"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              >
                <TemplateIcon name={t.icon} className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[12px] uppercase tracking-[0.18em] text-muted">
                  inbjudan till
                </div>
                <h1 className="font-display text-2xl text-fg">{i.recipientName}</h1>
              </div>
              <div className="ml-auto">
                {i.status === "archived" ? (
                  <Badge tone="muted">Arkiverad</Badge>
                ) : (
                  <Badge tone="accent">Aktiv</Badge>
                )}
              </div>
            </div>
            <p className="mt-5 font-display text-xl text-fg">{i.headline}</p>
            {i.message && <p className="mt-2 text-[15px] leading-relaxed text-muted">{i.message}</p>}
          </div>

          <div className="border-t border-border/10 px-6 py-4">
            <InviteDetailActions
              id={i.id}
              url={url}
              status={i.status}
              canResend={responses.length > 0 && !!i.notifyEmail}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/10 bg-surface/50 p-4">
              <s.icon className="h-4 w-4 text-muted" />
              <div className="mt-2 font-display text-xl text-fg">{s.value}</div>
              <div className="text-[12px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Meta */}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-border/10 bg-surface/40 p-5 text-[14px]">
          <Meta label="Länk" value={`/i/${i.slug}`} />
          <Meta label="Notis-mail" value={i.notifyEmail ?? "—"} />
          <Meta label="Skapad" value={formatDateTime(i.createdAt)} />
          <Meta label="Senast öppnad" value={i.openedAt ? formatDateTime(i.openedAt) : "—"} />
          <Meta label="Förfaller" value={i.expiresAt ? formatDateTime(i.expiresAt) : "Aldrig"} />
        </dl>

        {/* Responses */}
        <h2 className="mt-9 font-display text-xl text-fg">Svar</h2>
        {responses.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-border/10 bg-surface/40 px-5 py-10 text-center text-muted">
            Inga svar ännu. Spänningen lever.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {responses.map((r) => {
              const meta = ANSWER_LABEL[r.answerType] ?? ANSWER_LABEL.custom;
              return (
                <div key={r.id} className="rounded-2xl border border-border/10 bg-surface/50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={meta.tone}>{meta.text}</Badge>
                    <span className="text-[13px] text-muted">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-[15px] text-fg">“{r.answer}”</p>
                  {(r.timing || r.note) && (
                    <div className="mt-3 space-y-1 text-[14px] text-muted">
                      {r.timing && <div>När: {r.timing}</div>}
                      {r.note && <div>Hälsning: {r.note}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-fg">{value}</dd>
    </div>
  );
}
