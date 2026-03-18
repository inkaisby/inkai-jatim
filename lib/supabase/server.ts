import { createClient } from "@supabase/supabase-js";

export type SupabaseEnvStatus =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; error: string };

export function getSupabaseEnv(): SupabaseEnvStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      ok: false,
      error:
        "Supabase env belum diset. Set `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.",
    };
  }

  return { ok: true, url, anonKey };
}

export function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env.ok) return null;

  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

