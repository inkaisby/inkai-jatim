import { NextResponse } from "next/server";
import { PORTAL_SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PORTAL_SESSION_COOKIE, "", getSessionCookieOptions(0));
  return response;
}
