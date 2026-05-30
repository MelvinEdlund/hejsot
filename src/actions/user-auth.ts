"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createUser, getUserByEmail, markEmailVerified } from "@/lib/queries";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUserSession, destroyUserSession } from "@/lib/auth/user-session";
import {
  createVerificationToken,
  redeemVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth/email-verification";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

// ── Validation schemas ───────────────────────────────────────────────────────

const signUpSchema = z.object({
  email:    z.string().trim().email("Ogiltig e-postadress."),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken."),
});

const signInSchema = z.object({
  email:    z.string().trim().email("Ogiltig e-postadress."),
  password: z.string().min(1, "Fyll i lösenord."),
});

export type AuthState = { ok: boolean; error?: string; requiresVerification?: boolean };

// ── Actions ──────────────────────────────────────────────────────────────────

/**
 * Sign up a new user account.
 * Account is created but NOT active until the verification link is clicked.
 */
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = clientIp(await headers());
  const { success } = await rateLimit(`signup:${ip}`, { limit: 5, windowSec: 3600 });
  if (!success) return { ok: false, error: "För många registreringar. Försök igen om en stund." };

  const parsed = signUpSchema.safeParse({
    email:    formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Kontrollera fälten." };
  }

  const { email, password } = parsed.data;

  // Deliberately vague — avoids revealing whether the email is already registered.
  const existing = await getUserByEmail(email);
  if (existing) {
    return { ok: false, error: "Något gick fel. Kontrollera uppgifterna och försök igen." };
  }

  const passwordHash = await hashPassword(password);
  const res = await createUser(email, passwordHash);
  if (!res.ok || !res.userId) {
    return { ok: false, error: "Kunde inte skapa konto. Försök igen." };
  }

  // Send verification email (best-effort — account is created regardless).
  const token = await createVerificationToken(res.userId);
  await sendVerificationEmail(email.toLowerCase().trim(), token);

  return { ok: true, requiresVerification: true };
}

/**
 * Sign in with email + password.
 * Requires that the email has been verified.
 */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = clientIp(await headers());
  const { success } = await rateLimit(`signin:${ip}`, { limit: 10, windowSec: 900 });
  if (!success) return { ok: false, error: "För många inloggningsförsök. Vänta en stund." };

  const parsed = signInSchema.safeParse({
    email:    formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Kontrollera fälten." };
  }

  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);
  // Deliberately vague — avoid leaking whether the email exists.
  if (!user) return { ok: false, error: "Fel e-post eller lösenord." };

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return { ok: false, error: "Fel e-post eller lösenord." };

  // Block unverified accounts from logging in.
  if (!user.email_verified) {
    return {
      ok:    false,
      error: "Du måste bekräfta din e-postadress innan du kan logga in. Kolla inkorgen.",
      requiresVerification: true,
    };
  }

  await createUserSession({ sub: user.id, email: user.email, role: "user" });
  return { ok: true };
}

/**
 * Verifies an email using the token from the verification link.
 * Logs the user in immediately on success.
 */
export async function verifyEmail(token: string): Promise<AuthState> {
  if (!token || token.length !== 64) {
    return { ok: false, error: "Ogiltig eller utgången länk." };
  }

  const userId = await redeemVerificationToken(token);
  if (!userId) {
    return { ok: false, error: "Länken är ogiltig eller har redan använts. Registrera dig igen." };
  }

  const marked = await markEmailVerified(userId);
  if (!marked.ok) {
    return { ok: false, error: "Kunde inte verifiera kontot. Kontakta support." };
  }

  // Log in immediately after verification.
  await createUserSession({
    sub:   userId,
    email: marked.email ?? "",
    role:  "user",
  });
  return { ok: true };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await destroyUserSession();
}
