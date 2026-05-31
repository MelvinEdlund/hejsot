import { NextRequest, NextResponse } from "next/server";
import { getStripe, INVITE_PRICE_OERE, INVITE_CURRENCY } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      slug?: string;
      confirmedAt?: string; // ISO timestamp — ångerrättsbekräftelse
    };

    const { slug, confirmedAt } = body;

    // ── Validering ─────────────────────────────────────────────
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    // Kräv att klienten skickat bekräftelsen INNAN betalning skapas.
    // Detta är det serverside-gardet — frontend-checken är UI-lager.
    if (!confirmedAt || typeof confirmedAt !== "string") {
      return NextResponse.json(
        {
          error:
            "Du måste bekräfta att ångerrätten förfaller innan betalning kan genomföras.",
        },
        { status: 400 },
      );
    }

    // Enkel sanity-check: tidsstämpeln bör vara nylig (max 30 min gammal)
    const confirmedMs = new Date(confirmedAt).getTime();
    if (isNaN(confirmedMs) || Date.now() - confirmedMs > 30 * 60 * 1000) {
      return NextResponse.json(
        { error: "Bekräftelsen är för gammal. Ladda om sidan och försök igen." },
        { status: 400 },
      );
    }

    // ── Hämta inbjudan ──────────────────────────────────────────
    const { data } = await supabaseAdmin()
      .from("invitations")
      .select("id, slug, is_unlocked, recipient_name")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // Redan betald — skicka direkt till success-sidan utan ny charge
    if (data.is_unlocked) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      return NextResponse.json({
        already_unlocked: true,
        redirect_url: `${siteUrl}/skapa/klar?slug=${slug}`,
      });
    }

    // ── Spara ångerrättsbekräftelse i DB ────────────────────────
    // Lagras som bevis oavsett om betalningen lyckas (compliance).
    await supabaseAdmin()
      .from("invitations")
      .update({ angerratt_confirmed_at: confirmedAt })
      .eq("slug", slug);

    // ── Skapa Stripe Checkout-session ───────────────────────────
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: INVITE_CURRENCY,
      line_items: [
        {
          price_data: {
            currency: INVITE_CURRENCY,
            unit_amount: INVITE_PRICE_OERE,
            product_data: {
              name: "HejSöt – Lås upp din inbjudan",
              description: `Personlig dejtinbjudan till ${data.recipient_name as string}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { slug, angerratt_confirmed_at: confirmedAt },
      success_url: `${siteUrl}/skapa/klar?slug=${slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/skapa?cancelled=1`,
      locale: "sv",
      payment_method_types: ["card", "klarna"],
      payment_intent_data: {
        metadata: { slug, angerratt_confirmed_at: confirmedAt },
      },
      // ── Steg 4: Stripe visar ångerrättstext som extra bekräftelse ──
      custom_text: {
        terms_of_service_acceptance: {
          message:
            "Jag förstår att tjänsten påbörjas omedelbart och att ångerrätten förfaller " +
            "i enlighet med Distansavtalslagen (2 kap. 11 §). " +
            "Läs [användarvillkoren](" +
            siteUrl +
            "/anvandarvillkor).",
        },
      },
      consent_collection: {
        terms_of_service: "required",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
