import type { TemplateId } from "@/lib/templates";

/** Lifecycle status for an invite. */
export type InviteStatus = "active" | "archived";

/** How the recipient replied. */
export type AnswerType = "yes" | "maybe" | "custom" | "no";

/** Which set of doodles floats around in the background. */
export const STICKER_PACK_IDS = [
  "mixed",
  "hearts",
  "cats",
  "flowers",
  "food",
  "sparkles",
  "doodle",
] as const;
export type StickerPack = (typeof STICKER_PACK_IDS)[number];

// ── Extras (v5) ──────────────────────────────────────────────────

export type BgTheme =
  | "none"
  | "starfield"
  | "bubbles"
  | "aurora"
  | "roses"
  | "heartbeat"
  | "snow";

export type QuizQuestion = {
  q: string;     // question text
  opts: string[]; // 2-4 answer options (no "wrong" answer - all are fun)
};

export type GifItem = {
  url: string;
  caption?: string;
};

export type InviteExtras = {
  bgTheme?: BgTheme;
  reasons?: string[];       // up to 5 "reasons to say yes"
  countdown?: string;       // ISO datetime string for countdown display
  musicUrl?: string;        // Spotify / YouTube / Apple Music URL
  musicLabel?: string;      // e.g. "var lat" - shown under the link
  yesText?: string;         // custom yes-button label, e.g. "sjalvklart"
  quiz?: QuizQuestion[];    // 1-3 fun questions shown AFTER open, before respond
  gifs?: GifItem[];         // up to 4 GIFs/images - shown per slide (slide 0 = sealed, 1 = open, ...)
  // legacy single-gif fields (backward compat)
  gifUrl?: string;
  gifCaption?: string;
};

// ── Main domain model ────────────────────────────────────────────

export type Invitation = {
  id: string;
  slug: string;
  userId: string | null;
  recipientName: string;
  senderName: string | null;
  template: TemplateId;
  headline: string;
  message: string;
  heroImageUrl: string | null;
  askTiming: boolean;
  playfulNo: boolean;
  dateOptions: string[];
  stickerPack: StickerPack;
  photoCaption: string | null;
  secretNote: string | null;
  extras: InviteExtras | null;
  status: InviteStatus;
  notifyEmail: string | null;
  expiresAt: string | null;
  isUnlocked: boolean;
  stripeSessionId: string | null;
  createdAt: string;
  openedAt: string | null;
  openCount: number;
  // joined / derived
  responseCount?: number;
  latestAnswerType?: AnswerType | null;
};

/** Public shape sent to the invite page - never includes notifyEmail. */
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
  | "stickerPack"
  | "photoCaption"
  | "secretNote"
  | "extras"
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
  user_id: string | null;
  recipient_name: string;
  sender_name: string | null;
  template: string | null;
  headline: string;
  message: string;
  hero_image_url: string | null;
  ask_timing: boolean | null;
  playful_no: boolean | null;
  date_options: string[] | null;
  sticker_pack: string | null;
  photo_caption: string | null;
  secret_note: string | null;
  extras: InviteExtras | null;
  status: string | null;
  notify_email: string | null;
  expires_at: string | null;
  is_unlocked: boolean;
  stripe_session_id: string | null;
  created_at: string;
  opened_at: string | null;
  open_count: number;
};

export type ResponseRow = {
  id: string;
  invitation_id: string;
  answer_type: string;
  answer: string;
  chosen_date: string | null;
  note: string | null;
  created_at: string;
};

// ── Mappers ──────────────────────────────────────────────────────
export function rowToInvitation(r: InvitationRow): Invitation {
  return {
    id: r.id,
    slug: r.slug,
    userId: r.user_id ?? null,
    recipientName: r.recipient_name,
    senderName: r.sender_name,
    template: (r.template ?? "custom") as TemplateId,
    headline: r.headline,
    message: r.message ?? "",
    heroImageUrl: r.hero_image_url,
    askTiming: r.ask_timing ?? true,
    playfulNo: r.playful_no ?? false,
    dateOptions: r.date_options ?? [],
    stickerPack: ((STICKER_PACK_IDS as readonly string[]).includes(r.sticker_pack ?? "")
      ? r.sticker_pack
      : "mixed") as StickerPack,
    photoCaption: r.photo_caption,
    secretNote: r.secret_note,
    extras: r.extras ?? null,
    status: (r.status ?? "active") as InviteStatus,
    notifyEmail: r.notify_email,
    expiresAt: r.expires_at,
    isUnlocked: r.is_unlocked ?? false,
    stripeSessionId: r.stripe_session_id ?? null,
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
    playfulNo: i.playfulNo,
    dateOptions: i.dateOptions,
    stickerPack: i.stickerPack,
    photoCaption: i.photoCaption,
    secretNote: i.secretNote,
    extras: i.extras,
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
