import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PortalRoleName, PortalScope, PortalSessionUser } from "./types";

type DbUser = {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  isDeleted: boolean;
  managedProvinceId: string | null;
  managedBranchId: string | null;
  managedDojoId: string | null;
};

export async function findUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false as const, error: "Supabase admin belum dikonfigurasi." };

  const { data, error } = await supabase
    .from("User")
    .select(
      "id, email, passwordHash, fullName, isActive, isDeleted, managedProvinceId, managedBranchId, managedDojoId",
    )
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  if (!data || data.isDeleted) return { ok: false as const, error: "Email atau password salah." };

  return { ok: true as const, data };
}

export async function getUserRoles(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("_UserRoles")
    .select("Role(name)")
    .eq("B", userId);

  if (error || !data) return [];

  return data
    .map((row) => {
      const role = row.Role as { name: string } | { name: string }[] | null;
      if (Array.isArray(role)) return role[0]?.name as PortalRoleName | undefined;
      return role?.name as PortalRoleName | undefined;
    })
    .filter(Boolean) as PortalRoleName[];
}

export async function getPortalProfileStatus(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("portal_member_profiles")
    .select("status, full_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return data.status as "pending" | "approved" | "rejected";
}

export function buildScope(user: DbUser): PortalScope {
  return {
    provinceId: user.managedProvinceId,
    branchId: user.managedBranchId,
    dojoId: user.managedDojoId,
  };
}

export async function buildSessionUser(user: DbUser): Promise<PortalSessionUser> {
  const [roles, profileStatus] = await Promise.all([
    getUserRoles(user.id),
    getPortalProfileStatus(user.id),
  ]);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles,
    scope: buildScope(user),
    profileStatus,
  };
}

export async function assignMemberRole(userId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false as const, error: "Supabase admin belum dikonfigurasi." };

  const { data: role, error: roleError } = await supabase
    .from("Role")
    .select("id")
    .eq("name", "MEMBER")
    .single();

  if (roleError || !role) {
    return { ok: false as const, error: "Role MEMBER tidak ditemukan." };
  }

  const { error } = await supabase.from("_UserRoles").insert({ A: role.id, B: userId });
  if (error) return { ok: false as const, error: error.message };

  return { ok: true as const };
}
