import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/utils";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/upload-url
 *
 * Issues a Supabase signed upload token for the hero-images bucket.
 * The client uses this token to upload directly to Supabase Storage —
 * no anon-upload policy on the bucket is required.
 *
 * Rate-limited to 10 uploads per 10 min per IP so the bucket cannot
 * be flooded anonymously.
 */
export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────────────
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`upload:${ip}`, {
    limit: 10,
    windowSec: 600,
  });
  if (!success) {
    return NextResponse.json(
      { error: "För många uppladdningar. Försök igen om en stund." },
      { status: 429 },
    );
  }

  // ── Validate request body ───────────────────────────────────────────
  let body: { mimeType?: unknown; size?: unknown };
  try {
    body = (await req.json()) as { mimeType?: unknown; size?: unknown };
  } catch {
    return NextResponse.json({ error: "Ogiltig begäran." }, { status: 400 });
  }

  const { mimeType, size } = body;

  if (
    typeof mimeType !== "string" ||
    !(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)
  ) {
    return NextResponse.json(
      { error: "Filtyp inte tillåten." },
      { status: 400 },
    );
  }
  if (typeof size !== "number" || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Filen är för stor (max 5 MB)." },
      { status: 400 },
    );
  }

  // ── Create signed upload URL ────────────────────────────────────────
  const ext = (mimeType as AllowedMime).split("/")[1] ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabaseAdmin()
    .storage.from("hero-images")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: "Kunde inte skapa uppladdnings-URL." },
      { status: 500 },
    );
  }

  const { data: urlData } = supabaseAdmin()
    .storage.from("hero-images")
    .getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl: urlData.publicUrl,
  });
}
