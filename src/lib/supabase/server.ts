import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

/**
 * Server-side Supabase client using the service-role key.
 *
 * This key bypasses Row Level Security, so it must ONLY ever run on the
 * server (this module is marked "server-only"). All reads/writes to
 * invitations + responses go through here, which is why RLS can stay locked
 * down with zero public policies — the browser can never touch these tables.
 */
let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const env = serverEnv();
  client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "hejsot" } },
  });
  return client;
}
