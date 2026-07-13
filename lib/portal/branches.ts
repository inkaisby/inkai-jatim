import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type BranchOption = {
  id: string;
  name: string;
  city: string | null;
};

const JATIM_PROVINCE_NAME = "JAWA TIMUR";

export async function getJatimBranches(): Promise<{
  ok: true;
  data: BranchOption[];
} | {
  ok: false;
  error: string;
}> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, error: "Supabase belum dikonfigurasi." };
  }

  const { data: province, error: provinceError } = await supabase
    .from("Province")
    .select("id")
    .eq("name", JATIM_PROVINCE_NAME)
    .maybeSingle();

  if (provinceError) {
    return { ok: false, error: provinceError.message };
  }

  if (!province) {
    return { ok: false, error: "Provinsi Jawa Timur tidak ditemukan." };
  }

  const { data, error } = await supabase
    .from("Branch")
    .select("id, name, city")
    .eq("provinceId", province.id)
    .eq("isDeleted", false)
    .order("name");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data ?? [] };
}
