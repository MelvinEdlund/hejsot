import { SignJWT, jwtVerify } from "jose";

/**
 * Pure JWT helpers — no next/headers import — safe on the edge and in server
 * actions. Handles both the admin cookie and the regular-user cookie.
 */

export const SESSION_COOKIE      = "hejsot_session";       // admin
export const USER_SESSION_COOKIE = "hejsot_user";          // regular user
export const MAX_AGE_SECONDS     = 60 * 60 * 24 * 7;       // 7 days

// ── Admin session ────────────────────────────────────────────────────────────

export type SessionPayload = {
  sub: string;   // admin email
  role: "admin";
};

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET is missing or too short (min 32 chars).");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { sub: payload.sub, role: "admin" };
  } catch {
    return null;
  }
}

// ── Regular-user session ─────────────────────────────────────────────────────

export type UserSessionPayload = {
  sub: string;    // user UUID (users.id)
  email: string;
  role: "user";
};

export async function signUserSession(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifyUserSession(
  token: string | undefined,
): Promise<UserSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      payload.role !== "user" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    )
      return null;
    return { sub: payload.sub, email: payload.email as string, role: "user" };
  } catch {
    return null;
  }
}
