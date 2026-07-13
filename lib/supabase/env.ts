export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  ).trim();
}

/** Client-safe key (anon / publishable). */
export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();
}

/** Server-only key (service role / secret). */
export function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    ""
  ).trim();
}

/** PostgreSQL URL for migrations (prefer session-mode DIRECT_URL). */
export function getDatabaseUrl() {
  return (
    process.env.DIRECT_URL ??
    process.env.SUPABASE_DB_URL ??
    process.env.DATABASE_URL ??
    ""
  ).trim();
}

export function getPortalSessionSecret() {
  return process.env.PORTAL_SESSION_SECRET?.trim() ?? "";
}

export function getPublicAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).trim();
}

export type SupabaseEnvStatus =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; error: string };

export function getSupabaseEnv(): SupabaseEnvStatus {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return {
      ok: false,
      error:
        "Supabase env belum diset. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (atau NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    };
  }

  return { ok: true, url, anonKey };
}
