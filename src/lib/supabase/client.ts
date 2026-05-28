"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicConfig } from "@/lib/env";

/**
 * Browser Supabase client using the public anon key. Used ONLY for uploading
 * hero images to the public `hero-images` Storage bucket. It has no access to
 * the invitations/responses tables (RLS denies anon by default).
 *
 * Returns null if Supabase isn't configured, so image upload degrades
 * gracefully (the rest of the app uses template gradients, no image needed).
 */
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (!publicConfig.supabaseUrl || !publicConfig.supabaseAnonKey) return null;
  if (client) return client;
  client = createClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
    auth: { persistSession: false },
  });
  return client;
}
