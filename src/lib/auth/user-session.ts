import { cookies } from "next/headers";
import {
  USER_SESSION_COOKIE,
  MAX_AGE_SECONDS,
  signUserSession,
  verifyUserSession,
  revokeToken,
  type UserSessionPayload,
} from "@/lib/auth/jwt";
import { randomUUID } from "node:crypto";

export { USER_SESSION_COOKIE, type UserSessionPayload };

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
};

export async function createUserSession(
  payload: Omit<UserSessionPayload, "jti">,
): Promise<void> {
  const jti   = randomUUID();
  const token = await signUserSession({ ...payload, jti });
  (await cookies()).set(USER_SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getUserSession(): Promise<UserSessionPayload | null> {
  return verifyUserSession((await cookies()).get(USER_SESSION_COOKIE)?.value);
}

/**
 * Destroys the user session cookie AND revokes the jti in Redis so the token
 * cannot be replayed after logout.
 */
export async function destroyUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken    = cookieStore.get(USER_SESSION_COOKIE)?.value;

  if (rawToken) {
    const session = await verifyUserSession(rawToken);
    if (session?.jti) {
      await revokeToken(session.jti, MAX_AGE_SECONDS);
    }
  }

  cookieStore.set(USER_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
