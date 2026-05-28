/**
 * Lightweight fixed-window rate limiting.
 *
 * - If UPSTASH_REDIS_REST_* are set, uses Upstash (works across serverless
 *   instances and the edge) via its REST API.
 * - Otherwise falls back to an in-memory window (fine for local dev / a
 *   single instance).
 *
 * Usage:
 *   const { success } = await rateLimit(`respond:${ip}`, { limit: 20, windowSec: 600 });
 *   if (!success) // reject
 */

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number; // epoch ms when the window resets
};

type Options = { limit: number; windowSec: number };

// ── In-memory fallback ────────────────────────────────────────────
const buckets = new Map<string, { count: number; reset: number }>();

function memoryLimit(key: string, { limit, windowSec }: Options): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const entry = buckets.get(key);

  if (!entry || entry.reset <= now) {
    const reset = now + windowMs;
    buckets.set(key, { count: 1, reset });
    // Opportunistic cleanup so the map doesn't grow forever.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
    }
    return { success: true, remaining: limit - 1, reset };
  }

  entry.count += 1;
  const success = entry.count <= limit;
  return { success, remaining: Math.max(0, limit - entry.count), reset: entry.reset };
}

// ── Upstash REST ──────────────────────────────────────────────────
async function upstash(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

async function redisLimit(key: string, { limit, windowSec }: Options): Promise<RateLimitResult> {
  // INCR the counter; on first hit, set the window TTL.
  const count = Number(await upstash(["INCR", key]));
  if (count === 1) await upstash(["EXPIRE", key, windowSec]);
  const reset = Date.now() + windowSec * 1000;
  return { success: count <= limit, remaining: Math.max(0, limit - count), reset };
}

export async function rateLimit(key: string, opts: Options): Promise<RateLimitResult> {
  const hasUpstash =
    !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;
  try {
    return hasUpstash ? await redisLimit(key, opts) : memoryLimit(key, opts);
  } catch {
    // Never let the limiter take the app down — fail open to memory.
    return memoryLimit(key, opts);
  }
}
