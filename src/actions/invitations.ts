"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createInvitationSchema, updateInviteSchema } from "@/lib/validation";
import { getSession } from "@/lib/auth/session";
import { getUserSession } from "@/lib/auth/user-session";
import {
  insertInvitation,
  setInvitationStatus,
  deleteInvitation,
  getInvitationDetail,
} from "@/lib/queries";
import { makeSlug } from "@/lib/slug";
import { inviteUrl, clientIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { sendResponseNotification } from "@/lib/email/resend";
import type { AnswerType } from "@/lib/types";

type CreateResult = { ok: boolean; slug?: string; url?: string; error?: string };
type ActionResult = { ok: boolean; error?: string };

async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

async function currentUserId(): Promise<string | null> {
  const session = await getUserSession();
  return session?.sub ?? null;
}

/**
 * Create a new invite. Public-friendly: anyone can create one.
 * Logged-in users get the invite linked to their account.
 * Anonymous callers are rate-limited per IP.
 */
export async function createInvitation(input: unknown): Promise<CreateResult> {
  const admin = await isAdmin();
  const userId = await currentUserId();

  if (!admin && !userId) {
    const ip = clientIp(await headers());
    const { success } = await rateLimit(`create:${ip}`, { limit: 5, windowSec: 600 });
    if (!success) {
      return { ok: false, error: "For manga inbjudningar just nu. Forsok igen om en stund." };
    }
  }

  const parsed = createInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Kontrollera falten." };
  }
  const d = parsed.data;

  const expiresAt = d.expiresInDays
    ? new Date(Date.now() + d.expiresInDays * 86_400_000).toISOString()
    : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = makeSlug(d.recipientName);
    const rawExtras = d.extras ?? {};
    const hasExtras = Object.values(rawExtras).some(
      (v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
    );
    const extras = hasExtras ? rawExtras : null;

    const res = await insertInvitation({
      slug,
      userId,
      recipientName: d.recipientName,
      senderName: d.senderName?.trim() || null,
      template: d.template,
      headline: d.headline,
      message: d.message?.trim() || "",
      heroImageUrl: d.heroImageUrl?.trim() || null,
      askTiming: d.askTiming,
      playfulNo: d.playfulNo,
      dateOptions: (d.dateOptions ?? []).map((s) => s.trim()).filter(Boolean),
      stickerPack: d.stickerPack,
      photoCaption: d.photoCaption?.trim() || null,
      secretNote: d.secretNote?.trim() || null,
      extras,
      notifyEmail: d.notifyEmail?.trim() || null,
      expiresAt,
    });
    if (res.ok) {
      if (admin || userId) revalidatePath("/studio");
      return { ok: true, slug, url: inviteUrl(slug) };
    }
    if (!/duplicate key|unique/i.test(res.error ?? "")) {
      return { ok: false, error: res.error ?? "Kunde inte skapa inbjudan." };
    }
  }
  return { ok: false, error: "Kunde inte skapa en unik lank. Forsok igen." };
}

/** Admin: archive / activate / delete / resend the latest notification. */
export async function updateInvitation(input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Ej behorig." };

  const parsed = updateInviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ogiltig begaran." };
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
