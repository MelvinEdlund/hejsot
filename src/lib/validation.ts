import { z } from "zod";
import { TEMPLATE_IDS } from "@/lib/templates";

/**
 * Single source of truth for input validation. These Zod schemas are used by
 * the server actions (server-side, authoritative) and can be reused on the
 * client for instant feedback.
 */

const trimmed = (max: number) => z.string().trim().max(max);

export const createInvitationSchema = z.object({
  recipientName: trimmed(60).min(1, "Vem är inbjudan till?"),
  senderName: trimmed(60).optional().or(z.literal("")),
  template: z.enum(TEMPLATE_IDS),
  headline: trimmed(160).min(1, "Skriv en rubrik."),
  message: trimmed(600).optional().or(z.literal("")),
  heroImageUrl: z.string().url().max(500).optional().or(z.literal("")),
  askTiming: z.boolean().default(true),
  notifyEmail: z.string().email("Ogiltig e-postadress.").max(160).optional().or(z.literal("")),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const responseSchema = z.object({
  slug: trimmed(80).min(1),
  answerType: z.enum(["yes", "maybe", "custom"]),
  answer: trimmed(280).min(1),
  timing: trimmed(120).optional().or(z.literal("")),
  note: trimmed(400).optional().or(z.literal("")),
  // Honeypot field — must be empty. Real users never fill it; bots do.
  website: z.string().max(0).optional(),
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
