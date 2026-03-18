import type {
  PortalDojo,
  PortalDocument,
  PortalEvent,
  PortalPost,
} from "./types";
import { createSupabaseServerClient, getSupabaseEnv } from "@/lib/supabase/server";

type QueryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; hint?: string };

function missingEnvResult(): QueryResult<never> {
  const env = getSupabaseEnv();
  return {
    ok: false,
    error: env.ok
      ? "Supabase client tidak bisa dibuat."
      : env.error,
    hint:
      "Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ke environment. Untuk local, bisa pakai file `.env.local`.",
  };
}

function isMissingRelationError(message: string) {
  return (
    message.toLowerCase().includes("relation") &&
    message.toLowerCase().includes("does not exist")
  );
}

function formatSupabaseError(e: unknown) {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (typeof e === "object" && "message" in e && typeof e.message === "string")
    return e.message;
  return "Unknown error";
}

async function safeQuery<T>(fn: () => Promise<T>): Promise<QueryResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    const msg = formatSupabaseError(e);
    if (isMissingRelationError(msg)) {
      return {
        ok: false,
        error:
          "Tabel portal belum ada di database. Ini normal untuk tahap awal scaffold.",
        hint:
          "Buat tabel `portal_posts`, `portal_events`, `portal_dojos`, `portal_documents` di Supabase sesuai dokumen rapat.",
      };
    }
    return { ok: false, error: msg };
  }
}

export async function getPinnedPosts(limit = 3) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_posts")
      .select(
        "id,title,slug,excerpt,cover_image_path,status,visibility,is_pinned,pinned_order,published_at,created_at",
      )
      .eq("status", "published")
      .eq("visibility", "public")
      .eq("is_pinned", true)
      .order("pinned_order", { ascending: true, nullsFirst: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as PortalPost[];
  });
}

export async function getLatestPosts(limit = 6) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_posts")
      .select(
        "id,title,slug,excerpt,cover_image_path,status,visibility,is_pinned,pinned_order,published_at,created_at",
      )
      .eq("status", "published")
      .eq("visibility", "public")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as PortalPost[];
  });
}

export async function getPostBySlug(slug: string) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_posts")
      .select(
        "id,title,slug,excerpt,content,cover_image_path,status,visibility,is_pinned,pinned_order,published_at,created_at",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data ?? null) as PortalPost | null;
  });
}

export async function getUpcomingEvents(limit = 5) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("portal_events")
      .select(
        "id,title,slug,type,start_at,end_at,location_text,status,visibility,published_at,created_at",
      )
      .eq("status", "published")
      .eq("visibility", "public")
      .gte("start_at", nowIso)
      .order("start_at", { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as PortalEvent[];
  });
}

export async function getEventBySlug(slug: string) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_events")
      .select(
        "id,title,slug,type,start_at,end_at,location_text,status,visibility,published_at,created_at",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .eq("visibility", "public")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data ?? null) as PortalEvent | null;
  });
}

export async function getDojos(limit = 50) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_dojos")
      .select("id,name,slug,address,status,visibility,created_at")
      .eq("status", "active")
      .eq("visibility", "public")
      .order("name", { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as PortalDojo[];
  });
}

export async function getDojoBySlug(slug: string) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_dojos")
      .select("id,name,slug,address,status,visibility,created_at")
      .eq("slug", slug)
      .eq("status", "active")
      .eq("visibility", "public")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data ?? null) as PortalDojo | null;
  });
}

export async function getDocuments(limit = 50) {
  const env = getSupabaseEnv();
  if (!env.ok) return missingEnvResult();
  const supabase = createSupabaseServerClient();
  if (!supabase) return missingEnvResult();
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from("portal_documents")
      .select(
        "id,title,slug,file_path,version_label,status,visibility,published_at,created_at",
      )
      .eq("status", "published")
      .eq("visibility", "public")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data ?? []) as PortalDocument[];
  });
}

