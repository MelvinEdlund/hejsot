import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  rowToInvitation,
  rowToResponse,
  toPublicInvitation,
  type Invitation,
  type InvitationRow,
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
  "id, slug, recipient_name, sender_name, template, headline, message, hero_image_url, ask_timing, status, notify_email, expires_at, created_at, opened_at, open_count";

function isExpired(row: Pick<InvitationRow, "expires_at">): boolean {
  return !!row.expires_at && new Date(row.expires_at).getTime() < Date.now();
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
  if (row.status === "archived" || isExpired(row)) return null;
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
  recipientName: string;
  senderName: string | null;
  template: string;
  headline: string;
  message: string;
  heroImageUrl: string | null;
  askTiming: boolean;
  notifyEmail: string | null;
  expiresAt: string | null;
}): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const { error } = await supabaseAdmin().from("invitations").insert({
    slug: values.slug,
    recipient_name: values.recipientName,
    sender_name: values.senderName,
    template: values.template,
    headline: values.headline,
    message: values.message,
    hero_image_url: values.heroImageUrl,
    ask_timing: values.askTiming,
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
  if (invitation.status === "archived") return { ok: false, error: "Inbjudan är inte längre aktiv." };

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
