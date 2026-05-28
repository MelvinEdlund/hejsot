"use server";

import { revalidatePath } from "next/cache";
import { createInvitationSchema, updateInviteSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth/session";
import {
  insertInvitation,
  setInvitationStatus,
  deleteInvitation,
  getInvitationDetail,
} from "@/lib/queries";
import { makeSlug } from "@/lib/slug";
import { inviteUrl } from "@/lib/utils";
import { sendResponseNotification } from "@/lib/email/resend";
import type { AnswerType } from "@/lib/types";

type CreateResult = { ok: boolean; slug?: string; url?: string; error?: string };
type ActionResult = { ok: boolean; error?: string };

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

/** Admin: create a new invite. Retries on the (very unlikely) slug collision. */
export async function createInvitation(input: unknown): Promise<CreateResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Ej behörig." };

  const parsed = createInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Kontrollera fälten." };
  }
  const d = parsed.data;

  const expiresAt = d.expiresInDays
    ? new Date(Date.now() + d.expiresInDays * 86_400_000).toISOString()
    : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug(d.recipientName);
    const res = await insertInvitation({
      slug,
      recipientName: d.recipientName,
      senderName: d.senderName?.trim() || null,
      template: d.template,
      headline: d.headline,
      message: d.message?.trim() || "",
      heroImageUrl: d.heroImageUrl?.trim() || null,
      askTiming: d.askTiming,
      notifyEmail: d.notifyEmail?.trim() || null,
      expiresAt,
    });
    if (res.ok) {
      revalidatePath("/studio");
      return { ok: true, slug, url: inviteUrl(slug) };
    }
    // 23505 = unique violation → try a fresh slug; otherwise bail.
    if (!/duplicate key|unique/i.test(res.error ?? "")) {
      return { ok: false, error: res.error ?? "Kunde inte skapa inbjudan." };
    }
  }
  return { ok: false, error: "Kunde inte skapa en unik länk. Försök igen." };
}

/** Admin: archive / activate / delete / resend the latest notification. */
export async function updateInvitation(input: unknown): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Ej behörig." };

  const parsed = updateInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ogiltig begäran." };
  const { id, action } = parsed.data;

  if (action === "archive" || action === "activate") {
    const ok = await setInvitationStatus(id, action === "archive" ? "archived" : "active");
    if (ok) revalidatePath("/studio");
    return { ok, error: ok ? undefined : "Kunde inte uppdatera." };
  }

  if (action === "delete") {
    const ok = await deleteInvitation(id);
    if (ok) revalidatePath("/studio");
    return { ok, error: ok ? undefined : "Kunde inte ta bort." };
  }

  // resend: re-send the most recent response notification to the creator.
  const detail = await getInvitationDetail(id);
  if (!detail) return { ok: false, error: "Inbjudan finns inte." };
  const latest = detail.responses[0];
  if (!latest) return { ok: false, error: "Inga svar att skicka." };
  if (!detail.invitation.notifyEmail) return { ok: false, error: "Ingen notis-adress angiven." };

  await sendResponseNotification({
    to: detail.invitation.notifyEmail,
    recipientName: detail.invitation.recipientName,
    slug: detail.invitation.slug,
    answerType: latest.answerType as AnswerType,
    answer: latest.answer,
    timing: latest.timing,
    note: latest.note,
  });
  return { ok: true };
}
