import type { TemplateId } from "@/lib/templates";

/** Lifecycle status for an invite. */
export type InviteStatus = "active" | "archived";

/** How the recipient replied. */
export type AnswerType = "yes" | "maybe" | "custom" | "no";

/**
 * Domain model (camelCase) used across the app. Mapped from the snake_case
 * Postgres rows by `rowToInvitation` / `rowToResponse` below.
 */
export type Invitation = {
  id: string;
  slug: string;
  recipientName: string;
  senderName: string | null;
  template: TemplateId;
  headline: string;
  message: string;
  heroImageUrl: string | null;
  askTiming: boolean;
  playfulNo: boolean;
  dateOptions: string[];
  status: InviteStatus;
  notifyEmail: string | null;
  expiresAt: string | null;
  createdAt: string;
  openedAt: string | null;
  openCount: number;
  // joined / derived
  responseCount?: number;
  latestAnswerType?: AnswerType | null;
};

/** Public shape sent to the invite page — never includes notifyEmail. */
export type PublicInvitation = Pick<
  Invitation,
  | "slug"
  | "recipientName"
  | "senderName"
  | "template"
  | "headline"
  | "message"
  | "heroImageUrl"
  | "askTiming"
  | "playfulNo"
  | "dateOptions"
>;

export type InviteResponse = {
  id: string;
  invitationId: string;
  answerType: AnswerType;
  answer: string;
  timing: string | null;
  note: string | null;
  createdAt: string;
};

// ── DB row shapes ────────────────────────────────────────────────
export type InvitationRow = {
  id: string;
  slug: string;
  recipient_name: string;
  sender_name: string | null;
  template: string | null;
  headline: string;
  message: string;
  hero_image_url: string | null;
  ask_timing: boolean | null;
  playful_no: boolean | null;
  date_options: string[] | null;
  status: string | null;
  notify_email: string | null;
  expires_at: string | null;
  created_at: string;
  opened_at: string | null;
  open_count: number;
};

export type ResponseRow = {
  id: string;
  invitation_id: string;
  answer_type: string;
  answer: string;
  chosen_date: string | null; // reused as "timing"
  note: string | null;
  created_at: string;
};

// ── Mappers ──────────────────────────────────────────────────────
export function rowToInvitation(r: InvitationRow): Invitation {
  return {
    id: r.id,
    slug: r.slug,
    recipientName: r.recipient_name,
    senderName: r.sender_name,
    template: (r.template ?? "custom") as TemplateId,
    headline: r.headline,
    message: r.message ?? "",
    heroImageUrl: r.hero_image_url,
    askTiming: r.ask_timing ?? true,
    playfulNo: r.playful_no ?? false,
    dateOptions: r.date_options ?? [],
    status: (r.status ?? "active") as InviteStatus,
    notifyEmail: r.notify_email,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    openedAt: r.opened_at,
    openCount: r.open_count ?? 0,
  };
}

export function toPublicInvitation(i: Invitation): PublicInvitation {
  return {
    slug: i.slug,
    recipientName: i.recipientName,
    senderName: i.senderName,
    template: i.template,
    headline: i.headline,
    message: i.message,
    heroImageUrl: i.heroImageUrl,
    askTiming: i.askTiming,
  };
}

export function rowToResponse(r: ResponseRow): InviteResponse {
  return {
    id: r.id,
    invitationId: r.invitation_id,
    answerType: (r.answer_type as AnswerType) ?? "custom",
    answer: r.answer,
    timing: r.chosen_date,
    note: r.note,
    createdAt: r.created_at,
  };
}
