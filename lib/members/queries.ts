import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getScopedDojoIds } from "@/lib/auth/permissions";
import type { PortalSessionUser } from "@/lib/auth/types";

export type MemberListItem = {
  id: string;
  userId: string;
  fullName: string;
  email: string | null;
  status: string;
  profileStatus: string | null;
  dojoId: string;
  dojoName: string | null;
  branchName: string | null;
  createdAt: string;
};

export async function listMembersInScope(
  user: PortalSessionUser,
  options: { status?: string; limit?: number } = {},
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false as const, error: "Supabase admin belum dikonfigurasi." };

  const dojoIds = await getScopedDojoIds(user);
  if (dojoIds.length === 0) return { ok: true as const, data: [] as MemberListItem[] };

  let query = supabase
    .from("Member")
    .select(
      "id, userId, fullName, status, dojoId, createdAt, Dojo(name, Branch(name)), User(email)",
    )
    .in("dojoId", dojoIds)
    .eq("isDeleted", false)
    .order("createdAt", { ascending: false })
    .limit(options.limit ?? 100);

  if (options.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) return { ok: false as const, error: error.message };

  const userIds = data?.map((m) => m.userId) ?? [];
  const { data: profiles } = userIds.length
    ? await supabase
        .from("portal_member_profiles")
        .select("user_id, status")
        .in("user_id", userIds)
    : { data: [] as { user_id: string; status: string }[] };

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.status]) ?? []);

  const items: MemberListItem[] =
    data?.map((row) => {
      const dojo = row.Dojo as
        | { name: string; Branch?: { name: string } | { name: string }[] }
        | { name: string; Branch?: { name: string } | { name: string }[] }[]
        | null;
      const dojoObj = Array.isArray(dojo) ? dojo[0] : dojo;
      const branchData = dojoObj?.Branch;
      const branch = Array.isArray(branchData) ? branchData[0] : branchData;
      const userRow = row.User as { email: string } | { email: string }[] | null;
      const email = Array.isArray(userRow) ? userRow[0]?.email : userRow?.email;

      return {
        id: row.id,
        userId: row.userId,
        fullName: row.fullName,
        email: email ?? null,
        status: row.status,
        profileStatus: profileMap.get(row.userId) ?? null,
        dojoId: row.dojoId,
        dojoName: dojoObj?.name ?? null,
        branchName: branch?.name ?? null,
        createdAt: row.createdAt,
      };
    }) ?? [];

  return { ok: true as const, data: items };
}

export async function verifyMemberInScope(
  user: PortalSessionUser,
  memberId: string,
  action: "approve" | "reject",
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false as const, error: "Supabase admin belum dikonfigurasi." };

  const dojoIds = await getScopedDojoIds(user);
  if (dojoIds.length === 0) return { ok: false as const, error: "Tidak ada cakupan dojo." };

  const { data: member, error: memberError } = await supabase
    .from("Member")
    .select("id, userId, dojoId, fullName")
    .eq("id", memberId)
    .eq("isDeleted", false)
    .maybeSingle();

  if (memberError || !member) return { ok: false as const, error: "Anggota tidak ditemukan." };
  if (!dojoIds.includes(member.dojoId)) {
    return { ok: false as const, error: "Forbidden: anggota di luar cakupan wilayah Anda." };
  }

  const memberStatus = action === "approve" ? "Active" : "Rejected";
  const profileStatus = action === "approve" ? "approved" : "rejected";
  const now = new Date().toISOString();

  const { error: updateMemberError } = await supabase
    .from("Member")
    .update({ status: memberStatus, updatedAt: now })
    .eq("id", memberId);

  if (updateMemberError) return { ok: false as const, error: updateMemberError.message };

  const { data: existingProfile } = await supabase
    .from("portal_member_profiles")
    .select("id, full_name")
    .eq("user_id", member.userId)
    .maybeSingle();

  if (existingProfile) {
    const { error: profileError } = await supabase
      .from("portal_member_profiles")
      .update({ status: profileStatus, updated_at: now })
      .eq("user_id", member.userId);

    if (profileError) return { ok: false as const, error: profileError.message };
  } else {
    const { error: profileError } = await supabase.from("portal_member_profiles").insert({
      user_id: member.userId,
      member_id: member.id,
      full_name: member.fullName,
      status: profileStatus,
    });

    if (profileError) return { ok: false as const, error: profileError.message };
  }

  return { ok: true as const, status: profileStatus };
}
