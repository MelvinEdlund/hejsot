import { z } from "zod";
import { TEMPLATE_IDS } from "@/lib/templates";
import { STICKER_PACK_IDS } from "@/lib/types";

const trimmed = (max: number) => z.string().trim().max(max);

// ── Quiz / Extras schemas ────────────────────────────────────────

const quizQuestionSchema = z.object({
  q: trimmed(140).min(1),
  opts: z.array(trimmed(80).min(1)).min(2).max(4),
});

const BG_THEMES = ["none", "starfield", "bubbles", "aurora", "roses", "heartbeat", "snow"] as const;

const extrasSchema = z
  .object({
    bgTheme: z.enum(BG_THEMES).optional(),
    reasons: z.array(trimmed(120).min(1)).max(5).optional(),
    countdown: z.string().optional().or(z.literal("")),
    musicUrl: z
      .string()
      .max(500)
      .refine(
        (v) => !v || /^(https?:\/\/|spotify:)/i.test(v),
        "Musik-URL måste vara en https://-länk eller spotify:-URI.",
      )
      .optional()
      .or(z.literal("")),
    musicLabel: trimmed(80).optional().or(z.literal("")),
    yesText: trimmed(60).optional().or(z.literal("")),
    quiz: z.array(quizQuestionSchema).max(3).optional(),
    gifs: z
      .array(z.object({ url: z.string().url().max(500), caption: trimmed(80).optional() }))
      .max(4)
      .optional(),
    // legacy compat
    gifUrl: z.string().url().max(500).optional().or(z.literal("")),
    gifCaption: trimmed(80).optional().or(z.literal("")),
  })
  .optional();

// ── Main create schema ───────────────────────────────────────────

export const createInvitationSchema = z.object({
  recipientName: trimmed(60).min(1, "Vem är inbjudan till?"),
  senderName: trimmed(60).optional().or(z.literal("")),
  template: z.enum(TEMPLATE_IDS),
  headline: trimmed(160).min(1, "Skriv en rubrik."),
  message: trimmed(600).optional().or(z.literal("")),
  heroImageUrl: z.string().url().max(500).optional().or(z.literal("")),
  askTiming: z.boolean().default(true),
  playfulNo: z.boolean().default(false),
  dateOptions: z.array(trimmed(80).min(1)).max(5).default([]),
  stickerPack: z.enum(STICKER_PACK_IDS).default("mixed"),
  photoCaption: trimmed(80).optional().or(z.literal("")),
  secretNote: trimmed(240).optional().or(z.literal("")),
  notifyEmail: z.string().email("Ogiltig e-postadress.").max(160).optional().or(z.literal("")),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
  extras: extrasSchema,
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const responseSchema = z.object({
  slug: trimmed(80).min(1),
  answerType: z.enum(["yes", "maybe", "custom", "no"]),
  answer: trimmed(280).min(1),
  timing: trimmed(280).optional().or(z.literal("")),
  note: trimmed(400).optional().or(z.literal("")),
  website: z.string().max(0).optional(), // honeypot
});

export type ResponseInput = z.infer<typeof responseSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Ogiltig e-postadress."),
  password: z.string().min(1, "Fyll i lösenord."),
});

export const updateInviteSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["archive", "activate", "delete", "resend"]),
});
