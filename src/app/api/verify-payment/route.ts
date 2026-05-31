import { NextRequest, NextResponse } from "next/server";
import { isInvitationUnlocked, unlockInvitationBySession } from "@/lib/queries";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Polled by the /skapa/klar success page to confirm payment.
 * Fallback in case webhook fires after the user lands on the page.
 *
 * GET /api/verify-payment?slug=xyz&session_id=cs_xxx
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const sessionId = searchParams.get("session_id");

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  // Fast path: webhook already ran
  const alreadyUnlocked = await isInvitationUnlocked(slug);
  if (alreadyUnlocked) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    return NextResponse.json({
      unlocked: true,
      url: `${siteUrl}/i/${slug}`,
    });
  }

  // Fallback: verify directly with Stripe if we have a session_id
  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status === "paid" &&
        session.metadata?.slug === slug
      ) {
        await unlockInvitationBySession(sessionId, slug);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        return NextResponse.json({
          unlocked: true,
          url: `${siteUrl}/i/${slug}`,
        });
      }
    } catch (err) {
      console.error("[verify-payment] stripe error:", err);
    }
  }

  return NextResponse.json({ unlocked: false });
}
