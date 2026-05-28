"use server";

import { headers } from "next/headers";
import { loginSchema } from "@/lib/validation";
import { verifyAdminCredentials } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

type LoginState = { ok: boolean; error?: string };

/**
 * Admin login. Rate limited per IP to slow brute-force. Uses a constant-time
 * credential check and, on success, issues a signed httpOnly session cookie.
 * Returns a result the client uses to redirect (we don't redirect() here so
 * the form can show inline errors).
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  const { success } = await rateLimit(`login:${ip}`, { limit: 8, windowSec: 900 });
  if (!success) return { ok: false, error: "För många försök. Vänta en stund och försök igen." };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ogiltiga uppgifter." };
  }

  const { email, password } = parsed.data;
  if (!verifyAdminCredentials(email, password)) {
    // Deliberately vague — don't reveal which field was wrong.
    return { ok: false, error: "Fel e-post eller lösenord." };
  }

  await createSession({ sub: email.toLowerCase(), role: "admin" });
  return { ok: true };
}

export async function logout(): Promise<void> {
  await destroySession();
}
