import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PORTAL_SESSION_COOKIE, getSessionFromCookie } from "@/lib/auth/session-edge";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(PORTAL_SESSION_COOKIE)?.value;
  const user = await getSessionFromCookie(token);

  if (!user) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login", "1");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
