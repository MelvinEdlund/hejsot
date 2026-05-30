import { SignJWT, jwtVerify } from "jose";

/**
 * Pure JWT helpers — no next/headers import — safe on the edge and in server
 * actions. Handles both the admin cookie and the regular-user cookie.
 *
 * Token revocation:
 *  Every token carries a `jti` (JWT ID, random UUID). On logout the jti is
 *  written to Upstash Redis with TTL = remaining token lifetime. Every call to
 *  verifySession / verifyUserSession checks the blocklist before returning a
 *  valid payload. If Redis is unavailable the check fails-open (token is not
 *  blocked) to avoid taking down the app on a Redis outage.
 */

export const SESSION_COOKIE      = "hejsot_session";       // admin
export const USER_SESSION_COOKIE = "hejsot_user";          // regular user
export const MAX_AGE_SECONDS     = 60 * 60 * 24 * 7;       // 7 days

// ── Shared secret ─────────────────────────────────────────────────────────────

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET is missing or too short (min 32 chars).");
  return new TextEncoder().encode(s);
}

// ── Redis revocation helpers ──────────────────────────────────────────────────

async function upstashCmd(command: (string | number)[]): Promise<unknown> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // Redis not configured — skip
  const res = await fetch(url, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify(command),
    cache:   "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

/**
 * Write a jti to the revocation blocklist.
 * TTL = remaining token lifetime so the key expires automatically.
 */
export async function revokeToken(jti: string, ttlSeconds: number): Promise<void> {
  if (ttlSeconds <= 0) return;
  try {
    await upstashCmd(["SET", `revoked:${jti}`, "1", "EX", ttlSeconds]);
  } catch {
    /* best-effort — a Redis blip shouldn't break logout */
  }
}

/** Returns true when the jti is in the blocklist. Fails-open on Redis errors. */
async function isRevoked(jti: string): Promise<boolean> {
  try {
    const result = await upstashCmd(["GET", `revoked:${jti}`]);
    return result !== null;
  } catch {
    return false; // fail-open: don't block valid sessions on Redis outage
  }
}

// ── Admin session ─────────────────────────────────────────────────────────────

export type SessionPayload = {
  sub:  string;     // admin email
  role: "admin";
  jti:  string;     // JWT ID — used for revocation
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    const jti = typeof payload.jti === "string" ? payload.jti : null;
    if (jti && (await isRevoked(jti))) return null;
    return { sub: payload.sub, role: "admin", jti: jti ?? "" };
  } catch {
    return null;
  }
}

// ── Regular-user session ──────────────────────────────────────────────────────

export type UserSessionPayload = {
  sub:   string;    // user UUID (users.id)
  email: string;
  role:  "user";
  jti:   string;    // JWT ID — used for revocation
};

export async function signUserSession(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setJti(payload.jti)
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
      payload.role  !== "user" ||
      typeof payload.sub   !== "string" ||
      typeof payload.email !== "string"
    )
      return null;
    const jti = typeof payload.jti === "string" ? payload.jti : null;
    if (jti && (await isRevoked(jti))) return null;
    return {
      sub:   payload.sub,
      email: payload.email as string,
      role:  "user",
      jti:   jti ?? "",
    };
  } catch {
    return null;
  }
}
