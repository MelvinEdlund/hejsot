import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  rowToInvitation,
  rowToResponse,
  toPublicInvitation,
  type Invitation,
  type InvitationRow,
  type InviteExtras,
  type InviteResponse,
  type PublicInvitation,
  type ResponseRow,
  type InviteStatus,
} from "@/lib/types";

/**
 * Server-only data access for invitations + responses. All Supabase reads and
 * writes funnel through here so pages and server actions stay thin and the
 * service-role client never leaks.
 */

const INVITE_COLUMNS =
  "id, slug, user_id, recipient_name, sender_name, template, headline, message, hero_image_url, ask_timing, playful_no, date_options, sticker_pack, photo_caption, secret_note, extras, status, notify_email, expires_at, created_at, opened_at, open_count";

function isExpired(row: Pick<InvitationRow, "expires_at">): boolean {
  return !!row.expires_at && new Date(row.expires_at).getTime() < Date.now();
}

async function purgeExpiredInvitations(): Promise<void> {
  const now = new Date().toISOString();
  await supabaseAdmin()
    .from("invitations")
    .delete()
    .not("expires_at", "is", null)
    .lt("expires_at", now);
}

/** Public invite for the /i/[slug] page. Null if missing, archived or expired. */
export async function getPublicInvitation(slug: string): Promise<PublicInvitation | null> {
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .select(INVITE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as InvitationRow;
  if (row.status === "archived") return null;
  if (isExpired(row)) {
    await deleteInvitation(row.id);
    return null;
  }
  return toPublicInvitation(rowToInvitation(row));
}

/** Full invite row by slug (used when emailing the creator). */
export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .select(INVITE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return rowToInvitation(data as InvitationRow);
}

/** Insert a new invite. Returns the created slug. */
export async function insertInvitation(values: {
  slug: string;
  userId: string | null;
  recipientName: string;
  senderName: string | null;
  template: string;
  headline: string;
  message: string;
  heroImageUrl: string | null;
  askTiming: boolean;
  playfulNo: boolean;
  dateOptions: string[];
  stickerPack: string;
  photoCaption: string | null;
  secretNote: string | null;
  extras: InviteExtras | null;
  notifyEmail: string | null;
  expiresAt: string | null;
}): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const { error } = await supabaseAdmin().from("invitations").insert({
    slug: values.slug,
    user_id: values.userId,
    recipient_name: values.recipientName,
    sender_name: values.senderName,
    template: values.template,
    headline: values.headline,
    message: values.message,
    hero_image_url: values.heroImageUrl,
    ask_timing: values.askTiming,
    playful_no: values.playfulNo,
    date_options: values.dateOptions,
    sticker_pack: values.stickerPack,
    photo_caption: values.photoCaption,
    secret_note: values.secretNote,
    extras: values.extras,
    status: "active",
    notify_email: values.notifyEmail,
    expires_at: values.expiresAt,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, slug: values.slug };
}

/** Atomically record a view via the increment_open_count() SQL function. */
export async function recordOpen(slug: string): Promise<void> {
  await supabaseAdmin().rpc("increment_open_count", { p_slug: slug });
}

/** Insert a response. Returns the parent invite (for notifications). */
export async function insertResponse(values: {
  slug: string;
  answerType: string;
  answer: string;
  timing: string | null;
  note: string | null;
}): Promise<{ ok: boolean; invitation?: Invitation; error?: string }> {
  const invitation = await getInvitationBySlug(values.slug);
  if (!invitation) return { ok: false, error: "Inbjudan finns inte." };
  if (invitation.status === "archived") {
    return { ok: false, error: "Inbjudan ar inte langre aktiv." };
  }
  if (invitation.expiresAt && new Date(invitation.expiresAt).getTime() < Date.now()) {
    await deleteInvitation(invitation.id);
    return { ok: false, error: "Inbjudan har forfallit." };
  }

  const { error } = await supabaseAdmin().from("responses").insert({
    invitation_id: invitation.id,
    answer_type: values.answerType,
    answer: values.answer,
    chosen_date: values.timing,
    note: values.note,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, invitation };
}

// ── Admin ────────────────────────────────────────────────────────
type InvitationWithCount = InvitationRow & { responses: { count: number }[] };

/** All invites for the admin dashboard, newest first, with response counts. */
export async function listInvitations(): Promise<Invitation[]> {
  await purgeExpiredInvitations();
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .select(`${INVITE_COLUMNS}, responses(count)`)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as InvitationWithCount[]).map((row) => ({
    ...rowToInvitation(row),
    responseCount: row.responses?.[0]?.count ?? 0,
  }));
}

/** A single invite + its responses for the detail view. */
export async function getInvitationDetail(
  id: string,
): Promise<{ invitation: Invitation; responses: InviteResponse[] } | null> {
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .select(`${INVITE_COLUMNS}, responses(*)`)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const { responses, ...row } = data as InvitationRow & { responses: ResponseRow[] };
  return {
    invitation: rowToInvitation(row as InvitationRow),
    responses: (responses ?? [])
      .map(rowToResponse)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  };
}

export async function setInvitationStatus(id: string, status: InviteStatus): Promise<boolean> {
  const { error } = await supabaseAdmin().from("invitations").update({ status }).eq("id", id);
  return !error;
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin().from("invitations").delete().eq("id", id);
  return !error;
}

// ── User account queries ─────────────────────────────────────────

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const { data, error } = await supabaseAdmin()
    .from("users")
    .insert({ email: email.toLowerCase().trim(), password_hash: passwordHash })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, userId: (data as { id: string }).id };
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("users")
    .select("id, email, password_hash, created_at")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error || !data) return null;
  return data as UserRow;
}

/** Personal dashboard: a user's own invites, newest first, with response counts. */
export async function listUserInvitations(userId: string): Promise<Invitation[]> {
  await purgeExpiredInvitations();
  const { data, error } = await supabaseAdmin()
    .from("invitations")
    .select(`${INVITE_COLUMNS}, responses(count)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as InvitationWithCount[]).map((row) => ({
    ...rowToInvitation(row),
    responseCount: row.responses?.[0]?.count ?? 0,
  }));
}
