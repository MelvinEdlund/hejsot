"use server";

import { headers } from "next/headers";
import { responseSchema } from "@/lib/validation";
import { insertResponse, recordOpen } from "@/lib/queries";
import { sendResponseNotification } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";
import type { AnswerType } from "@/lib/types";

type SubmitResult = { ok: boolean; error?: string };

/**
 * Public: count a view. Best-effort, never throws to the client.
 * Rate-limited to 60 per IP per 10 min to prevent open-count inflation.
 */
export async function recordView(slug: string): Promise<void> {
  if (!slug || slug.length > 80) return;
  try {
    const ip = clientIp(await headers());
    const { success } = await rateLimit(`view:${ip}`, { limit: 60, windowSec: 600 });
    if (!success) return;
    await recordOpen(slug);
  } catch {
    /* analytics must never break the experience */
  }
}

/**
 * Public: record the recipient's reply.
 * - Validates input with Zod (authoritative, server-side).
 * - Honeypot: the hidden `website` field must be empty.
 * - Rate limited per IP to curb abuse.
 * - Notifies the creator by email (best-effort).
 */
export async function submitResponse(input: unknown): Promise<SubmitResult> {
  const parsed = responseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Ogiltigt svar.",
    };
  }
  const data = parsed.data;

  // Honeypot tripped → silently pretend success so bots get no signal.
  if (data.website && data.website.length > 0) return { ok: true };

  const ip = clientIp(await headers());
  const { success } = await rateLimit(`respond:${ip}`, {
    limit: 20,
    windowSec: 600,
  });
  if (!success)
    return {
      ok: false,
      error: "För många svar just nu. Försök igen om en stund.",
    };

  const result = await insertResponse({
    slug: data.slug,
    answerType: data.answerType,
    answer: data.answer,
    timing: data.timing || null,
    note: data.note || null,
  });
  if (!result.ok || !result.invitation) {
    return { ok: false, error: result.error ?? "Kunde inte spara svaret." };
  }

  const inv = result.invitation;
  if (inv.notifyEmail) {
    await sendResponseNotification({
      to: inv.notifyEmail,
      recipientName: inv.recipientName,
      slug: inv.slug,
      answerType: data.answerType as AnswerType,
      answer: data.answer,
      timing: data.timing || null,
      note: data.note || null,
    });
  }

  return { ok: true };
}
