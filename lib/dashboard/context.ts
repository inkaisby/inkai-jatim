import { cache } from "react";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch } from "@/lib/inkai-api/server";
import { JATIM_PROVINCE_NAME } from "@/lib/portal/organization";
import type { PortalSessionUser } from "@/lib/auth/types";
import { getHierarchyLevel, getPrimaryRoleLabel } from "./labels";

export type HierarchyNode = {
  level: "pusat" | "provinsi" | "cabang" | "dojo";
  id: string | null;
  name: string;
};

export type DojoSummary = { id: string; name: string; address: string | null };

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
  recentDojos: DojoSummary[];
  allDojos: DojoSummary[];
};

const RECENT_DOJO_LIMIT = 6;

function toDojoSummaries(
  dojos: DojoSummary[] | null | undefined,
): DojoSummary[] {
  return dojos ?? [];
}

function splitDojoLists(all: DojoSummary[]) {
  return {
    allDojos: all,
    recentDojos: all.slice(0, RECENT_DOJO_LIMIT),
  };
}

function mapDojoRow(row: Record<string, unknown>): DojoSummary {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    address: (row.address as string | null) ?? null,
  };
}

export const getDashboardContext = cache(async (user: PortalSessionUser): Promise<DashboardContext> => {
  const token = await getInkaiTokenFromCookies();
  const hierarchyLevel = getHierarchyLevel(user.roles);
  const roleLabel = getPrimaryRoleLabel(user.roles);

  const hierarchy: HierarchyNode[] = [
    { level: "pusat", id: null, name: "INKAI Pusat (Nasional)" },
    { level: "provinsi", id: user.scope.provinceId, name: JATIM_PROVINCE_NAME },
  ];

  let stats = { provinces: 0, branches: 0, dojos: 0, members: 0 };
  let recentDojos: DojoSummary[] = [];
  let allDojos: DojoSummary[] = [];
  let memberStatus: string | null = null;
  let profileStatus = user.profileStatus;

  if (!token) {
    return {
      roleLabel,
      hierarchyLevel,
      hierarchy,
      stats,
      profileStatus,
      memberStatus,
      recentDojos,
      allDojos,
    };
  }

  const [statsRes, provincesRes, meRes] = await Promise.all([
    inkaiFetch("/v1/dashboard/stats", {}, token),
    inkaiFetch("/v1/org/provinces", {}, token),
    inkaiFetch("/v1/auth/me", {}, token),
  ]);

  if (meRes.res.ok) {
    const me = (meRes.data.data as Record<string, unknown>) ?? {};
    memberStatus = (me.status as string | null) ?? null;
    if (memberStatus) {
      profileStatus =
        memberStatus === "PENDING"
          ? "pending"
          : memberStatus === "REJECTED"
            ? "rejected"
            : "approved";
    }
  }

  if (statsRes.res.ok) {
    const s = (statsRes.data.data as Record<string, unknown>) ?? {};
    stats = {
      provinces: Number(s.totalProvinces ?? 1),
      branches: Number(s.totalBranches ?? 0),
      dojos: Number(s.totalDojos ?? 0),
      members: Number(s.totalMembers ?? 0),
    };
  }

  const provinces = provincesRes.res.ok
    ? ((provincesRes.data.data as Array<Record<string, unknown>>) ?? [])
    : [];
  const jatimProvince = provinces.find(
    (p) => String(p.name).toUpperCase() === JATIM_PROVINCE_NAME.toUpperCase(),
  );
  if (jatimProvince) {
    hierarchy[1] = {
      level: "provinsi",
      id: String(jatimProvince.id),
      name: String(jatimProvince.name),
    };
  }

  const scopeBranchId = user.scope.branchId;
  const scopeDojoId = user.scope.dojoId;

  if (scopeDojoId) {
    const { res, data } = await inkaiFetch(`/v1/org/dojo/${scopeDojoId}`, {}, token);
    if (res.ok) {
      const dojo = (data.data as Record<string, unknown>) ?? {};
      const branch = dojo.branch as { id?: string; name?: string } | undefined;
      if (branch?.name) {
        hierarchy.push({ level: "cabang", id: branch.id ?? null, name: branch.name });
      }
      hierarchy.push({ level: "dojo", id: scopeDojoId, name: String(dojo.name ?? "") });
      const single = [mapDojoRow(dojo)];
      allDojos = single;
      recentDojos = single;
    }
  } else if (scopeBranchId) {
    const { res, data } = await inkaiFetch(`/v1/org/dojos/${scopeBranchId}`, {}, token);
    if (res.ok) {
      const branchRes = await inkaiFetch(`/v1/org/branches/all`, {}, token);
      const branches = branchRes.res.ok
        ? ((branchRes.data.data as Array<Record<string, unknown>>) ?? [])
        : [];
      const branch = branches.find((b) => b.id === scopeBranchId);
      if (branch) {
        hierarchy.push({
          level: "cabang",
          id: String(branch.id),
          name: String(branch.name),
        });
      }
      const listed = toDojoSummaries(
        ((data.data as Array<Record<string, unknown>>) ?? []).map(mapDojoRow),
      );
      ({ allDojos, recentDojos } = splitDojoLists(listed));
    }
  } else if (jatimProvince) {
    const branches = (jatimProvince.branches as Array<Record<string, unknown>>) ?? [];
    if (branches[0]) {
      hierarchy.push({
        level: "cabang",
        id: String(branches[0].id),
        name: String(branches[0].name),
      });
    }
    const allBranchDojos: DojoSummary[] = [];
    for (const branch of branches) {
      const dojos = (branch.dojos as Array<Record<string, unknown>>) ?? [];
      allBranchDojos.push(...dojos.map(mapDojoRow));
    }
    allBranchDojos.sort((a, b) => a.name.localeCompare(b.name));
    ({ allDojos, recentDojos } = splitDojoLists(allBranchDojos));
  }

  return {
    roleLabel,
    hierarchyLevel,
    hierarchy,
    stats,
    profileStatus,
    memberStatus,
    recentDojos,
    allDojos,
  };
});
