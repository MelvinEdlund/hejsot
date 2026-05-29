import "server-only";
import {
  createHash,
  timingSafeEqual,
  scrypt,
  randomBytes,
} from "node:crypto";
import { promisify } from "node:util";
import { serverEnv } from "@/lib/env";

const scryptAsync = promisify(scrypt);

// ── Admin credentials ────────────────────────────────────────────────────────

/**
 * Verifies admin credentials against the configured ADMIN_EMAIL /
 * ADMIN_PASSWORD. Comparison is constant-time.
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
  return emailOk && passOk;
}

// ── User passwords (scrypt) ──────────────────────────────────────────────────

const KEY_LEN = 64;

/**
 * Hash a user password with scrypt. Returns "salt:hash" as a hex string.
 * Safe to store in the database.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verify a plaintext password against a stored "salt:hash" string.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derivedKey = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
    const storedBuf = Buffer.from(hash, "hex");
    if (derivedKey.length !== storedBuf.length) return false;
    return timingSafeEqual(derivedKey, storedBuf);
  } catch {
    return false;
  }
}
