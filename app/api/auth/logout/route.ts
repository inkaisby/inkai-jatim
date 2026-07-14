import { NextResponse } from "next/server";
import { INKAI_TOKEN_COOKIE, getInkaiTokenCookieOptions } from "@/lib/inkai-api/cookies";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(INKAI_TOKEN_COOKIE, "", { ...getInkaiTokenCookieOptions(0), maxAge: 0 });
  return response;
}
