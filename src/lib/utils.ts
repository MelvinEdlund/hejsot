import { siteUrl } from "@/lib/env";

/** Tiny classnames helper (no dependency). Filters falsy, joins with space. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Absolute URL for an invite. */
export function inviteUrl(slug: string): string {
  return `${siteUrl()}/i/${slug}`;
}

/** Format an ISO date as a readable Swedish date+time. */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Relative time in Swedish, e.g. "3 min sedan", "2 dagar sedan". */
export function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 45) return "nyss";
  if (min < 60) return `${min} min sedan`;
  if (hr < 24) return `${hr} h sedan`;
  if (day < 30) return `${day} ${day === 1 ? "dag" : "dagar"} sedan`;
  return formatDateTime(iso);
}

/**
 * Best-effort client IP from request headers (behind Vercel's proxy).
 * Accepts both the Web `Headers` and next/headers' ReadonlyHeaders.
 */
export function clientIp(headers: { get(name: string): string | null }): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** Escape user text before placing it into HTML (email templates). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
