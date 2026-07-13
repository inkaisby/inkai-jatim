import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
    const token = body.token?.trim();
    const password = body.password ?? "";

    if (!token || !password) {
      return NextResponse.json({ error: "Token dan password wajib diisi." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 500 });
    }

    const { data: user } = await supabase
      .from("User")
      .select("id, resetTokenExpiry")
      .eq("resetToken", token)
      .eq("isDeleted", false)
      .maybeSingle();

    if (!user?.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json({ error: "Token tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("User")
      .update({
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: now,
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Password berhasil diperbarui. Silakan login." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset password gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
