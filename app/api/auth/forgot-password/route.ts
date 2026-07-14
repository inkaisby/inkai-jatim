import { NextResponse } from "next/server";
import { inkaiFetch } from "@/lib/inkai-api/server";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`forgot:${ip}`, 5, 60_000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    await inkaiFetch("/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    return NextResponse.json({
      ok: true,
      message: "Jika email terdaftar, instruksi reset telah dikirim.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Permintaan gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
