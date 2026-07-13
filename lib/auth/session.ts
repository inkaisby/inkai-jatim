import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { PortalSessionPayload, PortalSessionUser } from "./types";

export const PORTAL_SESSION_COOKIE = "portal_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret) {
    throw new Error("PORTAL_SESSION_SECRET belum diset.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: PortalSessionUser) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;

  return new SignJWT({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    scope: user.scope,
    profileStatus: user.profileStatus,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSessionSecret());
}

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSessionSecret());
  return payload as unknown as PortalSessionPayload;
}

export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await readSessionToken(token);
    return {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      roles: payload.roles,
      scope: payload.scope,
      profileStatus: payload.profileStatus,
    } satisfies PortalSessionUser;
  } catch {
    return null;
  }
});

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
