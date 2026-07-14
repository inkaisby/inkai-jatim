import { cache } from "react";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch } from "@/lib/inkai-api/server";
import type { PortalSessionUser } from "./types";

export const getSessionUser = cache(async (): Promise<PortalSessionUser | null> => {
  const token = await getInkaiTokenFromCookies();
  if (!token) return null;

  const { res, data } = await inkaiFetch("/v1/auth/me", {}, token);
  if (!res.ok) return null;

  const user = (data.data as Record<string, unknown>) ?? null;
  if (!user?.id || !user.email) return null;

  const roles = Array.isArray(user.roles) ? (user.roles as PortalSessionUser["roles"]) : [];
  const memberStatus = (user.status as string | undefined) ?? "Active";

  return {
    id: String(user.id),
    email: String(user.email),
    fullName: (user.fullName as string | null) ?? null,
    roles,
    scope: {
      provinceId: (user.managedProvinceId as string | null) ?? null,
      branchId: (user.managedBranchId as string | null) ?? null,
      dojoId: (user.managedDojoId as string | null) ?? null,
    },
    profileStatus:
      memberStatus === "PENDING"
        ? "pending"
        : memberStatus === "REJECTED"
          ? "rejected"
          : "approved",
  };
});
