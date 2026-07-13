import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 500 });
    }

    const { data: user } = await supabase
      .from("User")
      .select("id, email")
      .eq("email", email)
      .eq("isDeleted", false)
      .maybeSingle();

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 1000 * 60 * 60).toISOString();

      await supabase
        .from("User")
        .update({ resetToken: token, resetTokenExpiry: expiry, updatedAt: new Date().toISOString() })
        .eq("id", user.id);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          ok: true,
          message: "Link reset password dibuat (mode dev).",
          resetUrl,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Jika email terdaftar, instruksi reset password telah dikirim.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Permintaan gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
