import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth/password";
import { assignMemberRole, findUserByEmail } from "@/lib/auth/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDojosByBranchId, getJatimProvince } from "@/lib/portal/organization";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  branchId?: string;
  dojoId?: string;
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`register:${ip}`, 8, 60_000);
    if (!rate.ok) {
      return NextResponse.json(
        { error: `Terlalu banyak pendaftaran. Coba lagi dalam ${rate.retryAfterSec} detik.` },
        { status: 429 },
      );
    }

    const body = (await request.json()) as RegisterBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const branchId = body.branchId ?? "";
    const dojoId = body.dojoId ?? "";

    if (!name || !email || !password || !branchId || !dojoId) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." },
        { status: 500 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing.ok) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 409 });
    }
    if (existing.error !== "Email atau password salah.") {
      return NextResponse.json({ error: existing.error }, { status: 500 });
    }

    const province = await getJatimProvince();
    if (!province.ok) {
      return NextResponse.json({ error: province.error }, { status: 400 });
    }

    const { data: branch, error: branchError } = await supabase
      .from("Branch")
      .select("id, name, provinceId")
      .eq("id", branchId)
      .eq("isDeleted", false)
      .maybeSingle();

    if (branchError || !branch || branch.provinceId !== province.data.id) {
      return NextResponse.json({ error: "Cabang tidak valid untuk Jawa Timur." }, { status: 400 });
    }

    const dojos = await getDojosByBranchId(branchId);
    if (!dojos.ok) {
      return NextResponse.json({ error: dojos.error }, { status: 400 });
    }

    const selectedDojo = dojos.data.find((dojo) => dojo.id === dojoId);
    if (!selectedDojo) {
      return NextResponse.json({ error: "Dojo/Ranting tidak valid untuk cabang terpilih." }, { status: 400 });
    }

    const userId = randomUUID();
    const memberId = randomUUID();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    const { error: userError } = await supabase.from("User").insert({
      id: userId,
      email,
      passwordHash,
      fullName: name,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const roleResult = await assignMemberRole(userId);
    if (!roleResult.ok) {
      await supabase.from("User").delete().eq("id", userId);
      return NextResponse.json({ error: roleResult.error }, { status: 500 });
    }

    const { error: memberError } = await supabase.from("Member").insert({
      id: memberId,
      userId,
      dojoId,
      fullName: name,
      status: "Pending",
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    if (memberError) {
      await supabase.from("_UserRoles").delete().eq("B", userId);
      await supabase.from("User").delete().eq("id", userId);
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    const { error: profileError } = await supabase.from("portal_member_profiles").insert({
      user_id: userId,
      member_id: memberId,
      branch_id: branchId,
      dojo_id: dojoId,
      full_name: name,
      branch_name: branch.name,
      dojo_name: selectedDojo.name,
      status: "pending",
    });

    if (profileError) {
      await supabase.from("Member").delete().eq("id", memberId);
      await supabase.from("_UserRoles").delete().eq("B", userId);
      await supabase.from("User").delete().eq("id", userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Pendaftaran berhasil! Menunggu verifikasi admin cabang/dojo.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pendaftaran gagal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
