import { jwtVerify } from "jose";
import type { PortalSessionUser, PortalRoleName, PortalScope } from "./types";

export const PORTAL_SESSION_COOKIE = "portal_session";

export async function getSessionFromCookie(
  token: string | undefined,
): Promise<PortalSessionUser | null> {
  if (!token) return null;

  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const data = payload as Record<string, unknown>;

    return {
      id: String(data.id),
      email: String(data.email),
      fullName: (data.fullName as string | null) ?? null,
      roles: (data.roles as PortalRoleName[]) ?? [],
      scope: (data.scope as PortalScope) ?? {
        provinceId: null,
        branchId: null,
        dojoId: null,
      },
      profileStatus: (data.profileStatus as PortalSessionUser["profileStatus"]) ?? null,
    };
  } catch {
    return null;
  }
}
