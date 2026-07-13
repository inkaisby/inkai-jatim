import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { JATIM_PROVINCE_NAME } from "@/lib/portal/organization";
import type { PortalRoleName, PortalSessionUser } from "./types";

const ADMIN_ROLES: PortalRoleName[] = [
  "ADMIN_PUSAT",
  "ADMINISTRATOR",
  "ADMIN",
  "ADMIN_PROVINCE",
  "ADMIN_BRANCH",
  "ADMIN_DOJO",
];

export async function getUserPermissionSlugs(userId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data: roleRows } = await supabase.from("_UserRoles").select("A").eq("B", userId);
  const roleIds = roleRows?.map((r) => r.A) ?? [];
  if (roleIds.length === 0) return [];

  const { data: permRows } = await supabase
    .from("RolePermission")
    .select("Permission(slug)")
    .in("roleId", roleIds);

  const slugs = new Set<string>();
  permRows?.forEach((row) => {
    const perm = row.Permission as { slug: string } | { slug: string }[] | null;
    if (Array.isArray(perm)) perm.forEach((p) => slugs.add(p.slug));
    else if (perm?.slug) slugs.add(perm.slug);
  });

  return [...slugs];
}

export function isAdminRole(roles: PortalRoleName[]) {
  return roles.some((role) => ADMIN_ROLES.includes(role));
}

export function hasPermission(permissions: string[], slug: string) {
  return permissions.includes(slug);
}

export function canManageMembers(user: PortalSessionUser, permissions: string[]) {
  if (!isAdminRole(user.roles)) return false;
  return hasPermission(permissions, "members") || hasPermission(permissions, "verification");
}

export function canVerifyMembers(user: PortalSessionUser, permissions: string[]) {
  if (!isAdminRole(user.roles)) return false;
  return hasPermission(permissions, "verification") || hasPermission(permissions, "members");
}

export async function getScopedDojoIds(user: PortalSessionUser): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const roles = user.roles;

  if (roles.some((r) => ["ADMIN_PUSAT", "ADMINISTRATOR", "ADMIN"].includes(r))) {
    const { data: province } = await supabase
      .from("Province")
      .select("id")
      .eq("name", JATIM_PROVINCE_NAME)
      .maybeSingle();
    if (!province) return [];

    const { data: branches } = await supabase
      .from("Branch")
      .select("id")
      .eq("provinceId", province.id)
      .eq("isDeleted", false);

    const branchIds = branches?.map((b) => b.id) ?? [];
    if (branchIds.length === 0) return [];

    const { data: dojos } = await supabase
      .from("Dojo")
      .select("id")
      .in("branchId", branchIds)
      .eq("isDeleted", false);

    return dojos?.map((d) => d.id) ?? [];
  }

  if (roles.includes("ADMIN_PROVINCE") && user.scope.provinceId) {
    const { data: branches } = await supabase
      .from("Branch")
      .select("id")
      .eq("provinceId", user.scope.provinceId)
      .eq("isDeleted", false);

    const branchIds = branches?.map((b) => b.id) ?? [];
    if (branchIds.length === 0) return [];

    const { data: dojos } = await supabase
      .from("Dojo")
      .select("id")
      .in("branchId", branchIds)
      .eq("isDeleted", false);

    return dojos?.map((d) => d.id) ?? [];
  }

  if (roles.includes("ADMIN_BRANCH") && user.scope.branchId) {
    const { data: dojos } = await supabase
      .from("Dojo")
      .select("id")
      .eq("branchId", user.scope.branchId)
      .eq("isDeleted", false);

    return dojos?.map((d) => d.id) ?? [];
  }

  if (roles.includes("ADMIN_DOJO") && user.scope.dojoId) {
    return [user.scope.dojoId];
  }

  const { data: member } = await supabase
    .from("Member")
    .select("dojoId")
    .eq("userId", user.id)
    .eq("isDeleted", false)
    .maybeSingle();

  return member?.dojoId ? [member.dojoId] : [];
}
