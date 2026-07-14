import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import {
  getInkaiTokenCookieOptions,
  INKAI_TOKEN_COOKIE,
} from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

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

    const { res, data } = await inkaiFetch(
      "/v1/auth/login",
      { method: "POST", body: JSON.stringify({ identifier: email, password }) },
      null,
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: inkaiErrorMessage(data, "Email atau password salah.") },
        { status: 401 },
      );
    }

    const token = typeof data.token === "string" ? data.token : "";
    const userPayload = (data.data as { user?: Record<string, unknown> })?.user ?? {};
    const memberStatus = (userPayload.status as string | undefined) ?? "Active";

    const response = NextResponse.json({
      ok: true,
      user: {
        id: userPayload.id,
        email: userPayload.email,
        fullName: userPayload.fullName,
        roles: userPayload.roles ?? [],
        profileStatus:
          memberStatus === "PENDING"
            ? "pending"
            : memberStatus === "REJECTED"
              ? "rejected"
              : "approved",
      },
      message: `Selamat datang${userPayload.fullName ? `, ${userPayload.fullName}` : ""}!`,
    });

    if (token) {
      response.cookies.set(INKAI_TOKEN_COOKIE, token, getInkaiTokenCookieOptions());
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
