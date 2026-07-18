import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INKAI_TOKEN_COOKIE } from "@/lib/inkai-api/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Compatibility: old /dashboard URLs → /admin
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const target = pathname.replace(/^\/dashboard/, "/admin");
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 308);
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(INKAI_TOKEN_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login", "1");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
