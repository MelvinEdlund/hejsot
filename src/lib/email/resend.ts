import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";
import { inviteUrl, escapeHtml } from "@/lib/utils";
import type { AnswerType } from "@/lib/types";

type Notification = {
  to: string;
  recipientName: string;
  slug: string;
  answerType: AnswerType;
  answer: string;
  timing?: string | null;
  note?: string | null;
};

/**
 * Sends the "you got a reply" notification to the invite's creator.
 * If RESEND_API_KEY isn't set, logs to the server console instead so the
 * whole flow works before email/DNS is configured.
 */
export async function sendResponseNotification(n: Notification): Promise<void> {
  const env = serverEnv();
  const url = inviteUrl(n.slug);

  if (!env.RESEND_API_KEY) {
    console.info(
      `[email:dev] → ${n.to} | ${n.recipientName} svarade "${n.answer}" (${n.answerType})` +
        (n.timing ? ` | när: ${n.timing}` : "") +
        (n.note ? ` | not: ${n.note}` : ""),
    );
    return;
  }

  const verdict =
    n.answerType === "yes"
      ? "sa ja."
      : n.answerType === "maybe"
        ? "är nyfiken."
        : "svarade.";

  const html = emailHtml({ ...n, verdict, url });
  const text =
    `${n.recipientName} ${verdict}\n\n` +
    `Svar: ${n.answer}\n` +
    (n.timing ? `När: ${n.timing}\n` : "") +
    (n.note ? `Meddelande: ${n.note}\n` : "") +
    `\nInbjudan: ${url}`;

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    console.info(`[email] Skickar från ${env.RESEND_FROM_EMAIL} till ${n.to}`);
    const result = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: n.to,
      subject: `${n.recipientName} svarade på din inbjudan`,
      html,
      text,
    });
    console.info("[email] Resend svar:", JSON.stringify(result));
  } catch (err) {
    // Never let a mail failure break the recipient's experience.
    console.error("[email] Resend failed:", err);
  }
}

function emailHtml(n: Notification & { verdict: string; url: string }): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;color:#a29cb0;font-size:13px;width:84px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#f4f2f9;font-size:15px;">${escapeHtml(value)}</td>
    </tr>`;

  return `<!doctype html><html><body style="margin:0;background:#0d0c11;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="font-size:14px;letter-spacing:.04em;color:#a29cb0;margin-bottom:18px;">hejsöt</div>
    <div style="background:#16141c;border:1px solid rgba(248,245,252,0.08);border-radius:20px;padding:28px;">
      <div style="font-size:22px;color:#f4f2f9;font-weight:600;margin-bottom:4px;">Du har fått ett svar</div>
      <div style="font-size:15px;color:#a29cb0;margin-bottom:20px;">
        <strong style="color:#ff7ca1;">${escapeHtml(n.recipientName)}</strong> ${escapeHtml(n.verdict)}
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Svar", n.answer)}
        ${n.timing ? row("När", n.timing) : ""}
        ${n.note ? row("Hälsning", n.note) : ""}
      </table>
      <a href="${n.url}" style="display:inline-block;margin-top:24px;background:linear-gradient(100deg,#ff7ca1,#b28aff);color:#0d0c11;text-decoration:none;font-weight:600;font-size:14px;padding:11px 18px;border-radius:999px;">Öppna inbjudan</a>
    </div>
    <div style="text-align:center;color:#6b6478;font-size:12px;margin-top:18px;">Skickat med kärlek · hejsöt</div>
  </div></body></html>`;
}
