import { createSupabaseServerClient } from "@/lib/supabase/server";

export const JATIM_PROVINCE_NAME = "JAWA TIMUR";

export type BranchOption = {
  id: string;
  name: string;
  city: string | null;
  provinceId: string;
};

export type DojoOption = {
  id: string;
  name: string;
  address: string | null;
  branchId: string;
};

export type ProvinceOption = {
  id: string;
  name: string;
};

function getReadableClient() {
  return createSupabaseServerClient();
}

export async function getJatimProvince() {
  const supabase = getReadableClient();
  if (!supabase) return { ok: false as const, error: "Supabase belum dikonfigurasi." };

  const { data, error } = await supabase
    .from("Province")
    .select("id, name")
    .eq("name", JATIM_PROVINCE_NAME)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "Provinsi Jawa Timur tidak ditemukan." };

  return { ok: true as const, data };
}

export async function getBranchesByProvinceId(provinceId: string) {
  const supabase = getReadableClient();
  if (!supabase) return { ok: false as const, error: "Supabase belum dikonfigurasi." };

  const { data, error } = await supabase
    .from("Branch")
    .select("id, name, city, provinceId")
    .eq("provinceId", provinceId)
    .eq("isDeleted", false)
    .order("name");

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data: (data ?? []) as BranchOption[] };
}

export async function getJatimBranches() {
  const province = await getJatimProvince();
  if (!province.ok) return province;
  return getBranchesByProvinceId(province.data.id);
}

export async function getDojosByBranchId(branchId: string) {
  const supabase = getReadableClient();
  if (!supabase) return { ok: false as const, error: "Supabase belum dikonfigurasi." };

  const { data, error } = await supabase
    .from("Dojo")
    .select("id, name, address, branchId")
    .eq("branchId", branchId)
    .eq("isDeleted", false)
    .order("name");

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data: (data ?? []) as DojoOption[] };
}
