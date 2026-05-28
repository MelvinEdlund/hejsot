import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  MAX_AGE_SECONDS,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/auth/jwt";

export { SESSION_COOKIE, type SessionPayload };

/**
 * Cookie-backed session helpers for server actions / server components.
 * (Middleware uses the pure helpers in jwt.ts instead, since next/headers
 * isn't available on the edge.)
 */

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: MAX_AGE_SECONDS });
}

export async function getSession(): Promise<SessionPayload | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function destroySession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
