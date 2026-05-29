"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createUser, getUserByEmail } from "@/lib/queries";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUserSession, destroyUserSession } from "@/lib/auth/user-session";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

// ── Validation schemas ───────────────────────────────────────────────────────

const signUpSchema = z.object({
  email: z.string().trim().email("Ogiltig e-postadress."),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken."),
});

const signInSchema = z.object({
  email: z.string().trim().email("Ogiltig e-postadress."),
  password: z.string().min(1, "Fyll i lösenord."),
});

export type AuthState = { ok: boolean; error?: string };

// ── Actions ──────────────────────────────────────────────────────────────────

/**
 * Sign up a new user account and log them in immediately.
 */
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = clientIp(await headers());
  const { success } = await rateLimit(`signup:${ip}`, { limit: 5, windowSec: 3600 });
  if (!success) return { ok: false, error: "För många registreringar. Försök igen om en stund." };

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Kontrollera fälten." };
  }

  const { email, password } = parsed.data;

  // Check if account already exists (give a vague message to avoid account enumeration).
  const existing = await getUserByEmail(email);
  if (existing) {
    return { ok: false, error: "Det finns redan ett konto med den e-postadressen." };
  }

  const passwordHash = await hashPassword(password);
  const res = await createUser(email, passwordHash);
  if (!res.ok || !res.userId) {
    return { ok: false, error: "Kunde inte skapa konto. Försök igen." };
  }

  await createUserSession({ sub: res.userId, email: email.toLowerCase().trim(), role: "user" });
  return { ok: true };
}

/**
 * Sign in with email + password.
 */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const ip = clientIp(await headers());
  const { success } = await rateLimit(`signin:${ip}`, { limit: 10, windowSec: 900 });
  if (!success) return { ok: false, error: "För många inloggningsförsök. Vänta en stund." };

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
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

  await createUserSession({ sub: user.id, email: user.email, role: "user" });
  return { ok: true };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await destroyUserSession();
}
