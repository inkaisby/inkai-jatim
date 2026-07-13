import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { JATIM_PROVINCE_NAME } from "@/lib/portal/organization";
import type { PortalSessionUser } from "@/lib/auth/types";
import { getHierarchyLevel, getPrimaryRoleLabel } from "./labels";

export type HierarchyNode = {
  level: "pusat" | "provinsi" | "cabang" | "dojo";
  id: string | null;
  name: string;
};

export type DashboardContext = {
  roleLabel: string;
  hierarchyLevel: ReturnType<typeof getHierarchyLevel>;
  hierarchy: HierarchyNode[];
  stats: {
    provinces: number;
    branches: number;
    dojos: number;
    members: number;
  };
  profileStatus: string | null;
  memberStatus: string | null;
  recentDojos: { id: string; name: string; address: string | null }[];
};

async function countMembersInDojos(dojoIds: string[]) {
  if (dojoIds.length === 0) return 0;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("Member")
    .select("*", { count: "exact", head: true })
    .in("dojoId", dojoIds)
    .eq("isDeleted", false);

  return count ?? 0;
}

async function getDojoIdsForBranch(branchId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("Dojo")
    .select("id")
    .eq("branchId", branchId)
    .eq("isDeleted", false);

  return data?.map((d) => d.id) ?? [];
}

export async function getDashboardContext(user: PortalSessionUser): Promise<DashboardContext> {
  const supabase = createSupabaseAdminClient();
  const hierarchyLevel = getHierarchyLevel(user.roles);
  const roleLabel = getPrimaryRoleLabel(user.roles);

  const hierarchy: HierarchyNode[] = [
    { level: "pusat", id: null, name: "INKAI Pusat (Nasional)" },
  ];

  let stats = { provinces: 0, branches: 0, dojos: 0, members: 0 };
  let recentDojos: DashboardContext["recentDojos"] = [];
  let memberStatus: string | null = null;
  let profileStatus = user.profileStatus;

  if (!supabase) {
    return {
      roleLabel,
      hierarchyLevel,
      hierarchy: [
        ...hierarchy,
        { level: "provinsi", id: null, name: JATIM_PROVINCE_NAME },
      ],
      stats,
      profileStatus,
      memberStatus,
      recentDojos,
    };
  }

  const { data: jatimProvince } = await supabase
    .from("Province")
    .select("id, name")
    .eq("name", JATIM_PROVINCE_NAME)
    .maybeSingle();

  hierarchy.push({
    level: "provinsi",
    id: jatimProvince?.id ?? null,
    name: jatimProvince?.name ?? JATIM_PROVINCE_NAME,
  });

  const { data: memberRecord } = await supabase
    .from("Member")
    .select("id, status, dojoId, Dojo(id, name, address, branchId, Branch(id, name, provinceId))")
    .eq("userId", user.id)
    .eq("isDeleted", false)
    .maybeSingle();

  if (memberRecord) {
    memberStatus = memberRecord.status;
  }

  const { data: portalProfile } = await supabase
    .from("portal_member_profiles")
    .select("status, branch_name, dojo_name, branch_id, dojo_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (portalProfile?.status) profileStatus = portalProfile.status;

  const scopeBranchId =
    user.scope.branchId ??
    (memberRecord?.Dojo as { Branch?: { id: string } } | null)?.Branch?.id ??
    portalProfile?.branch_id ??
    null;

  const scopeDojoId =
    user.scope.dojoId ?? memberRecord?.dojoId ?? portalProfile?.dojo_id ?? null;

  if (hierarchyLevel === "nasional") {
    const [{ count: provinceCount }, { count: branchCount }, { count: dojoCount }, { count: memberCount }] =
      await Promise.all([
        supabase.from("Province").select("*", { count: "exact", head: true }).eq("isDeleted", false),
        supabase.from("Branch").select("*", { count: "exact", head: true }).eq("isDeleted", false),
        supabase.from("Dojo").select("*", { count: "exact", head: true }).eq("isDeleted", false),
        supabase.from("Member").select("*", { count: "exact", head: true }).eq("isDeleted", false),
      ]);

    stats = {
      provinces: provinceCount ?? 0,
      branches: branchCount ?? 0,
      dojos: dojoCount ?? 0,
      members: memberCount ?? 0,
    };

    if (jatimProvince) {
      const { data: jatimBranches } = await supabase
        .from("Branch")
        .select("id, name")
        .eq("provinceId", jatimProvince.id)
        .eq("isDeleted", false)
        .limit(1);

      if (jatimBranches?.[0]) {
        hierarchy.push({ level: "cabang", id: jatimBranches[0].id, name: jatimBranches[0].name });
      }
    }
  } else if (hierarchyLevel === "provinsi" || (hierarchyLevel === "cabang" && scopeBranchId)) {
    const branchId = scopeBranchId ?? (jatimProvince
      ? (
          await supabase
            .from("Branch")
            .select("id, name")
            .eq("provinceId", jatimProvince.id)
            .eq("isDeleted", false)
            .limit(1)
        ).data?.[0]?.id
      : null);

    if (branchId) {
      const { data: branch } = await supabase
        .from("Branch")
        .select("id, name")
        .eq("id", branchId)
        .maybeSingle();

      if (branch) {
        hierarchy.push({ level: "cabang", id: branch.id, name: branch.name });
      }

      const dojoIds = await getDojoIdsForBranch(branchId);
      const { data: dojos } = await supabase
        .from("Dojo")
        .select("id, name, address")
        .eq("branchId", branchId)
        .eq("isDeleted", false)
        .order("name")
        .limit(6);

      recentDojos = dojos ?? [];
      stats = {
        provinces: 1,
        branches: 1,
        dojos: dojoIds.length,
        members: await countMembersInDojos(dojoIds),
      };

      if (scopeDojoId) {
        const { data: dojo } = await supabase
          .from("Dojo")
          .select("id, name")
          .eq("id", scopeDojoId)
          .maybeSingle();
        if (dojo) hierarchy.push({ level: "dojo", id: dojo.id, name: dojo.name });
      }
    }
  } else if (hierarchyLevel === "dojo" && scopeDojoId) {
    const { data: dojo } = await supabase
      .from("Dojo")
      .select("id, name, address, branchId, Branch(id, name)")
      .eq("id", scopeDojoId)
      .maybeSingle();

    if (dojo) {
      const branchData = dojo.Branch as { id: string; name: string } | { id: string; name: string }[] | null;
      const branch = Array.isArray(branchData) ? branchData[0] : branchData;
      if (branch) hierarchy.push({ level: "cabang", id: branch.id, name: branch.name });
      hierarchy.push({ level: "dojo", id: dojo.id, name: dojo.name });
      recentDojos = [{ id: dojo.id, name: dojo.name, address: dojo.address }];
      stats = {
        provinces: 1,
        branches: 1,
        dojos: 1,
        members: await countMembersInDojos([dojo.id]),
      };
    }
  } else {
    const dojoRaw = memberRecord?.Dojo as unknown;
    const dojo = (Array.isArray(dojoRaw) ? dojoRaw[0] : dojoRaw) as {
      id: string;
      name: string;
      address: string | null;
      Branch?: { id: string; name: string } | { id: string; name: string }[];
    } | null | undefined;

    if (dojo) {
      const branchData = dojo.Branch;
      const branch = Array.isArray(branchData) ? branchData[0] : branchData;
      if (branch) {
        hierarchy.push({ level: "cabang", id: branch.id, name: branch.name });
      } else if (portalProfile?.branch_name) {
        hierarchy.push({
          level: "cabang",
          id: portalProfile.branch_id,
          name: portalProfile.branch_name,
        });
      }

      hierarchy.push({ level: "dojo", id: dojo.id, name: dojo.name });
      recentDojos = [{ id: dojo.id, name: dojo.name, address: dojo.address }];
      stats = {
        provinces: 1,
        branches: 1,
        dojos: 1,
        members: await countMembersInDojos([dojo.id]),
      };
    } else if (portalProfile) {
      if (portalProfile.branch_name) {
        hierarchy.push({
          level: "cabang",
          id: portalProfile.branch_id,
          name: portalProfile.branch_name,
        });
      }
      if (portalProfile.dojo_name) {
        hierarchy.push({
          level: "dojo",
          id: portalProfile.dojo_id,
          name: portalProfile.dojo_name,
        });
      }
    }
  }

  return {
    roleLabel,
    hierarchyLevel,
    hierarchy,
    stats,
    profileStatus,
    memberStatus,
    recentDojos,
  };
}
