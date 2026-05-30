import "server-only";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";

/**
 * Email-verification tokens stored in Upstash Redis.
 *
 * Key:   verify:{token}
 * Value: userId (UUID string)
 * TTL:   24 hours
 *
 * Falls back to a no-op when Redis isn't configured (local dev without Redis).
 */

const TOKEN_TTL_SEC = 60 * 60 * 24; // 24 h

async function upstash(command: (string | number)[]): Promise<unknown> {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify(command),
    cache:   "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return ((await res.json()) as { result: unknown }).result;
}

/** Skapar ett verify-token och lagrar det i Redis. Returnerar tokenet. */
export async function createVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  try {
    await upstash(["SET", `verify:${token}`, userId, "EX", TOKEN_TTL_SEC]);
  } catch {
    // Redis not configured — log so dev knows
    console.warn("[email-verify] Redis not available; verification token not stored:", token);
  }
  return token;
}

/** Löser in tokenet. Returnerar userId om giltigt, annars null. Tar bort tokenet. */
export async function redeemVerificationToken(token: string): Promise<string | null> {
  if (!token || token.length !== 64) return null;
  try {
    const userId = (await upstash(["GETDEL", `verify:${token}`])) as string | null;
    return userId ?? null;
  } catch {
    return null;
  }
}

/** Skickar verifieringsmail via Resend. */
export async function sendVerificationEmail(
  to: string,
  token: string,
): Promise<void> {
  const env     = serverEnv();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hejsot.lol";
  const link    = `${siteUrl}/verify-email?token=${token}`;

  if (!env.RESEND_API_KEY) {
    console.info(`[email-verify:dev] Verify link for ${to}: ${link}`);
    return;
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from:    env.RESEND_FROM_EMAIL,
      to,
      subject: "Bekräfta din e-postadress · hejsöt",
      html:    verifyHtml(link),
      text:    `Klicka här för att bekräfta din e-post: ${link}\n\nLänken gäller i 24 timmar.`,
    });
  } catch (err) {
    console.error("[email-verify] Resend failed:", err);
  }
}

function verifyHtml(link: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0d0c11;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="font-size:14px;letter-spacing:.04em;color:#a29cb0;margin-bottom:18px;">hejsöt</div>
    <div style="background:#16141c;border:1px solid rgba(248,245,252,0.08);border-radius:20px;padding:28px;">
      <div style="font-size:22px;color:#f4f2f9;font-weight:600;margin-bottom:8px;">Bekräfta din e-post</div>
      <div style="font-size:15px;color:#a29cb0;margin-bottom:24px;">
        Klicka på knappen nedan för att aktivera ditt konto.
      </div>
      <a href="${link}"
         style="display:inline-block;background:linear-gradient(100deg,#ff7ca1,#b28aff);color:#0d0c11;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;">
        Bekräfta e-post
      </a>
      <div style="margin-top:20px;font-size:13px;color:#6b6478;">
        Länken gäller i 24 timmar. Om du inte skapade ett konto kan du ignorera det här mailet.
      </div>
    </div>
    <div style="text-align:center;color:#6b6478;font-size:12px;margin-top:18px;">hejsöt</div>
  </div></body></html>`;
}
