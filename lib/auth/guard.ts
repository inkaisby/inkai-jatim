import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch } from "@/lib/inkai-api/server";
import type { PortalSessionUser } from "./types";

export type AuthContext = {
  user: PortalSessionUser;
  token: string;
};

async function fetchSessionUser(token: string): Promise<PortalSessionUser | null> {
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
}

export async function requireAuth(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const token = await getInkaiTokenFromCookies();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await fetchSessionUser(token);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, ctx: { user, token } };
}

function isAdminRole(roles: PortalSessionUser["roles"]) {
  return roles.some((r) =>
    [
      "ADMIN_PUSAT",
      "ADMINISTRATOR",
      "ADMIN",
      "ADMIN_PROVINCE",
      "ADMIN_BRANCH",
      "ADMIN_DOJO",
    ].includes(r),
  );
}

export async function requireMemberManager(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  if (!isAdminRole(auth.ctx.user.roles)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden: akses kelola anggota ditolak." }, { status: 403 }),
    };
  }
  return auth;
}

export async function requireMemberVerifier(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  return requireMemberManager();
}
