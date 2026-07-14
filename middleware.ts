import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INKAI_TOKEN_COOKIE } from "@/lib/inkai-api/cookies";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
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
  matcher: ["/dashboard/:path*"],
};
