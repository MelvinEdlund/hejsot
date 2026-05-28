import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

/**
 * Verifies admin credentials against the configured ADMIN_EMAIL /
 * ADMIN_PASSWORD. Comparison is constant-time (we hash both sides to a
 * fixed length first, then timingSafeEqual) to avoid leaking length or
 * content through timing.
 *
 * For a single-admin product, comparing against a server-only env secret is
 * a reasonable, simple choice. To harden further later, swap ADMIN_PASSWORD
 * for a stored scrypt/argon2 hash — only this function would change.
 */
function constantTimeEquals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const env = serverEnv();
  const emailOk = constantTimeEquals(email.trim().toLowerCase(), env.ADMIN_EMAIL.toLowerCase());
  const passOk = constantTimeEquals(password, env.ADMIN_PASSWORD);
  // Evaluate both regardless of the first result to keep timing uniform.
  return emailOk && passOk;
}
