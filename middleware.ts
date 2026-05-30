import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  USER_SESSION_COOKIE,
  verifySession,
  verifyUserSession,
} from "@/lib/auth/jwt";

/**
 * Guards the entire /studio subtree.
 *
 *  /studio/login        → always public (admin login page)
 *  /studio/admin/**     → requires admin session (hejsot_session)
 *  /studio/invite/**    → requires admin session (hejsot_session)
 *  /studio/**           → requires either admin OR user session
 *
 * Runs on the edge, so it only uses the pure JWT helpers (no next/headers).
 */

/** Routes that require a full admin session. */
const ADMIN_ONLY = ["/studio/admin", "/studio/invite"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin login page ──────────────────────────────────────────────────
  if (pathname === "/studio/login") {
    // Already-authenticated admins skip the login page.
    const adminSession = await verifySession(
      req.cookies.get(SESSION_COOKIE)?.value,
    );
    if (adminSession)
      return NextResponse.redirect(new URL("/studio/admin", req.url));
    return NextResponse.next();
  }

  // ── Admin-only subtrees ───────────────────────────────────────────────
  if (ADMIN_ONLY.some((prefix) => pathname.startsWith(prefix))) {
    const adminSession = await verifySession(
      req.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!adminSession)
      return NextResponse.redirect(new URL("/studio/login", req.url));
    return NextResponse.next();
  }

  // ── All other /studio/* routes (user dashboard, new invite, etc.) ─────
  // Accept either a valid admin session OR a valid user session.
  const adminSession = await verifySession(
    req.cookies.get(SESSION_COOKIE)?.value,
  );
  if (adminSession) return NextResponse.next();

  const userSession = await verifyUserSession(
    req.cookies.get(USER_SESSION_COOKIE)?.value,
  );
  if (!userSession) {
    // Send to the public user login with a return path.
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*"],
};
