import "server-only";
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}

/** Price in smallest currency unit (öre). 19 SEK = 1900 öre */
export const INVITE_PRICE_OERE = 1900;
export const INVITE_CURRENCY = "sek";
