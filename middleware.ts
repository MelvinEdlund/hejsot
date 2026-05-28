import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

/**
 * Protects the hidden admin area. Every /studio route except /studio/login
 * requires a valid admin session cookie; otherwise we redirect to login.
 * Runs on the edge, so it only uses the pure JWT helpers (no next/headers).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page itself is public.
  if (pathname === "/studio/login") {
    // If already authenticated, send them straight to the dashboard.
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (session) return NextResponse.redirect(new URL("/studio", req.url));
    return NextResponse.next();
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/studio/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Guard the whole studio subtree.
  matcher: ["/studio/:path*"],
};
