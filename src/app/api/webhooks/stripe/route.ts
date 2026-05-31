import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { unlockInvitationBySession } from "@/lib/queries";

export const runtime = "nodejs";

// Stripe sends raw body — disable Next.js body parsing
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const slug = session.metadata?.slug;
    const sessionId = session.id;

    if (!slug) {
      console.error("[webhook] missing slug in session metadata", sessionId);
      return NextResponse.json({ ok: false });
    }

    // Only unlock when payment was actually captured (not just authorised)
    const paymentStatus = session.payment_status;
    if (paymentStatus !== "paid") {
      console.log("[webhook] session not yet paid, skipping", sessionId);
      return NextResponse.json({ ok: true });
    }

    const ok = await unlockInvitationBySession(sessionId, slug);
    if (!ok) {
      console.error("[webhook] failed to unlock", slug, sessionId);
    } else {
      console.log("[webhook] unlocked", slug);
    }
  }

  return NextResponse.json({ received: true });
}
