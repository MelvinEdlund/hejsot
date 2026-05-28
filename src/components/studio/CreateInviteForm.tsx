"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, ArrowRight } from "lucide-react";
import { TEMPLATE_LIST, TEMPLATES, type TemplateId } from "@/lib/templates";
import { createInvitation } from "@/actions/invitations";
import { cn } from "@/lib/utils";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { TemplateIcon } from "@/components/ui/TemplateIcon";
import { InvitePreview } from "@/components/studio/InvitePreview";
import { Spinner } from "@/components/ui/Spinner";

type Result = { slug: string; url: string };

export function CreateInviteForm() {
  const [template, setTemplate] = useState<TemplateId>("coffee");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [headline, setHeadline] = useState(TEMPLATES.coffee.defaultHeadline);
  const [message, setMessage] = useState(TEMPLATES.coffee.defaultMessage);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [askTiming, setAskTiming] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(0);
  const [touched, setTouched] = useState<{ h: boolean; m: boolean }>({ h: false, m: false });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function pickTemplate(id: TemplateId) {
    setTemplate(id);
    // Only overwrite copy the admin hasn't manually edited.
    if (!touched.h) setHeadline(TEMPLATES[id].defaultHeadline);
    if (!touched.m) setMessage(TEMPLATES[id].defaultMessage);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await createInvitation({
      recipientName,
      senderName: senderName || undefined,
      template,
      headline,
      message: message || undefined,
      notifyEmail: notifyEmail || undefined,
      askTiming,
      expiresInDays: expiresInDays || undefined,
    });
    setSubmitting(false);
    if (!res.ok || !res.url) {
      setError(res.error ?? "Något gick fel.");
      return;
    }
    setResult({ slug: res.slug!, url: res.url });
  }

  if (result) return <ShareSuccess result={result} />;

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
      {/* ── Form ── */}
      <div className="space-y-7">
        <section>
          <div className="text-[13px] font-medium text-muted">Stämning</div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {TEMPLATE_LIST.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => pickTemplate(t.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-3 text-left transition-all",
                  template === t.id
                    ? "border-transparent ring-2 ring-accent/60"
                    : "border-border/15 hover:border-border/30",
                )}
              >
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#0d0c11]"
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                >
                  <TemplateIcon name={t.icon} className="h-[16px] w-[16px]" />
                </span>
                <div className="mt-2 text-[13px] font-medium text-fg">{t.label}</div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Till vem?">
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              maxLength={60}
              placeholder="Sara"
              required
            />
          </Field>
          <Field label="Från (valfritt)">
            <Input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              maxLength={60}
              placeholder="Ditt namn"
            />
          </Field>
        </div>

        <Field label="Rubrik" hint="Den första raden hon läser.">
          <Input
            value={headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              setTouched((t) => ({ ...t, h: true }));
            }}
            maxLength={160}
            required
          />
        </Field>

        <Field label="Meddelande" hint="Håll det kort och äkta.">
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setTouched((t) => ({ ...t, m: true }));
            }}
            maxLength={600}
          />
        </Field>

        <Field label="Maila svaret till (valfritt)" hint="Vi mailar dig när hon svarar.">
          <Input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            maxLength={160}
            placeholder="du@exempel.se"
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/10 bg-surface/40 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={askTiming}
              onChange={(e) => setAskTiming(e.target.checked)}
              className="h-4 w-4 accent-[rgb(var(--accent))]"
            />
            <span className="text-[14px] text-fg">Fråga när det passar</span>
          </label>

          <label className="flex items-center gap-2 text-[14px] text-muted">
            Förfaller
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className="rounded-lg border border-border/15 bg-surface px-2.5 py-1.5 text-[14px] text-fg focus:outline-none"
            >
              <option value={0}>Aldrig</option>
              <option value={7}>Om 7 dagar</option>
              <option value={30}>Om 30 dagar</option>
            </select>
          </label>
        </div>

        {error && <p className="text-[14px] text-accent">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-2 px-7 text-[15px] font-medium text-[#0d0c11] transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? <Spinner /> : null}
            Skapa länk
            {!submitting && <ArrowRight className="h-[18px] w-[18px]" />}
          </button>
          <Link href="/studio" className="text-[14px] text-muted transition-colors hover:text-fg">
            Avbryt
          </Link>
        </div>
      </div>

      {/* ── Live preview ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 text-[12px] uppercase tracking-[0.18em] text-muted">Förhandsvisning</div>
        <InvitePreview
          template={template}
          recipientName={recipientName}
          headline={headline}
          message={message}
          senderName={senderName}
        />
      </div>
    </form>
  );
}

function ShareSuccess({ result }: { result: Result }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[#0d0c11]">
        <Check className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <h2 className="mt-6 font-display text-3xl font-medium text-fg">Länken är klar.</h2>
      <p className="mt-2 text-muted">Dela den med en enda person. Resten sköter den själv.</p>

      <div className="mt-7 flex items-center gap-2 rounded-full border border-border/15 bg-surface/60 p-1.5 pl-5">
        <span className="min-w-0 flex-1 truncate text-left text-[14px] text-muted">{result.url}</span>
        <button
          onClick={copy}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 text-[14px] font-medium text-[#0d0c11]"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Kopierad" : "Kopiera"}
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-5 text-[14px]">
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-fg transition-colors hover:text-accent"
        >
          <ExternalLink className="h-4 w-4" /> Förhandsgranska
        </a>
        <Link href="/studio/new" className="text-muted transition-colors hover:text-fg">
          Skapa en till
        </Link>
        <Link href="/studio" className="text-muted transition-colors hover:text-fg">
          Till översikten
        </Link>
      </div>
    </div>
  );
}
