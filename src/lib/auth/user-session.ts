import { cookies } from "next/headers";
import {
  USER_SESSION_COOKIE,
  MAX_AGE_SECONDS,
  signUserSession,
  verifyUserSession,
  type UserSessionPayload,
} from "@/lib/auth/jwt";

export { USER_SESSION_COOKIE, type UserSessionPayload };

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createUserSession(payload: UserSessionPayload): Promise<void> {
  const token = await signUserSession(payload);
  (await cookies()).set(USER_SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getUserSession(): Promise<UserSessionPayload | null> {
  return verifyUserSession((await cookies()).get(USER_SESSION_COOKIE)?.value);
}

export async function destroyUserSession(): Promise<void> {
  (await cookies()).set(USER_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
