import { NextResponse } from "next/server";
import { getSessionUser } from "./session";
import { getUserPermissionSlugs, canManageMembers, canVerifyMembers } from "./permissions";
import type { PortalSessionUser } from "./types";

export type AuthContext = {
  user: PortalSessionUser;
  permissions: string[];
};

export async function requireAuth(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const permissions = await getUserPermissionSlugs(user.id);
  return { ok: true, ctx: { user, permissions } };
}

export async function requireMemberManager(): Promise<
  { ok: true; ctx: AuthContext } | { ok: false; response: NextResponse }
> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (!canManageMembers(auth.ctx.user, auth.ctx.permissions)) {
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
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (!canVerifyMembers(auth.ctx.user, auth.ctx.permissions)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden: akses verifikasi ditolak." }, { status: 403 }),
    };
  }

  return auth;
}
