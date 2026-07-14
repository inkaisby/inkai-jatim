import { NextResponse } from "next/server";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`reset:${ip}`, 10, 60_000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { token?: string; password?: string };
    const token = body.token ?? "";
    const password = body.password ?? "";

    if (!token || !password) {
      return NextResponse.json({ error: "Token dan password wajib diisi." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const { res, data } = await inkaiFetch("/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: inkaiErrorMessage(data, "Reset password gagal.") },
        { status: res.status },
      );
    }

    return NextResponse.json({ ok: true, message: "Password berhasil diperbarui." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset password gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
