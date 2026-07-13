import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { buildSessionUser, findUserByEmail } from "@/lib/auth/rbac";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import {
  createSessionToken,
  getSessionCookieOptions,
  PORTAL_SESSION_COOKIE,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`login:${ip}`, 15, 60_000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const userResult = await findUserByEmail(email);
    if (!userResult.ok) {
      return NextResponse.json({ error: userResult.error }, { status: 401 });
    }

    const user = userResult.data;
    if (!user.isActive) {
      return NextResponse.json({ error: "Akun tidak aktif. Hubungi pengurus INKAI." }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    const sessionUser = await buildSessionUser(user);
    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      ok: true,
      user: sessionUser,
      message: `Selamat datang${sessionUser.fullName ? `, ${sessionUser.fullName}` : ""}!`,
    });

    response.cookies.set(PORTAL_SESSION_COOKIE, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
