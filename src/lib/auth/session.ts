import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  MAX_AGE_SECONDS,
  signSession,
  verifySession,
  revokeToken,
  type SessionPayload,
} from "@/lib/auth/jwt";
import { randomUUID } from "node:crypto";

export { SESSION_COOKIE, type SessionPayload };

/**
 * Cookie-backed session helpers for server actions / server components.
 * (Middleware uses the pure helpers in jwt.ts instead, since next/headers
 * isn't available on the edge.)
 */

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
};

export async function createSession(payload: Omit<SessionPayload, "jti">): Promise<void> {
  const jti   = randomUUID();
  const token = await signSession({ ...payload, jti });
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: MAX_AGE_SECONDS });
}

export async function getSession(): Promise<SessionPayload | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Destroys the session cookie AND adds the token's jti to the Redis revocation
 * blocklist so it cannot be replayed even before natural expiry.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken    = cookieStore.get(SESSION_COOKIE)?.value;

  if (rawToken) {
    const session = await verifySession(rawToken);
    if (session?.jti) {
      // Remaining TTL approximation — we revoke for the full window to be safe.
      await revokeToken(session.jti, MAX_AGE_SECONDS);
    }
  }

  cookieStore.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
