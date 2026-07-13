import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseEnv, getSupabaseUrl } from "./env";

export type { SupabaseEnvStatus } from "./env";
export { getSupabaseEnv } from "./env";

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

// Re-export for callers that need raw values
export function getSupabasePublicConfig() {
  return { url: getSupabaseUrl(), anonKey: getSupabaseAnonKey() };
}
