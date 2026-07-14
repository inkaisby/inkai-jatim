import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { JATIM_PROVINCE_NAME } from "@/lib/portal/organization";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

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

    const provinces = await inkaiFetch("/v1/org/provinces", {}, null);
    const provinceList = (provinces.data.data as Array<{ id: string; name: string }>) ?? [];
    const jatim = provinceList.find((p) => p.name.toUpperCase() === JATIM_PROVINCE_NAME);
    if (!jatim) {
      return NextResponse.json({ error: "Provinsi Jawa Timur tidak ditemukan." }, { status: 400 });
    }

    const branches = await inkaiFetch(`/v1/org/branches/${jatim.id}`, {}, null);
    const branchList = (branches.data.data as Array<{ id: string; provinceId: string }>) ?? [];
    const branch = branchList.find((b) => b.id === branchId && b.provinceId === jatim.id);
    if (!branch) {
      return NextResponse.json({ error: "Cabang tidak valid untuk Jawa Timur." }, { status: 400 });
    }

    const dojos = await inkaiFetch(`/v1/org/dojos/${branchId}`, {}, null);
    const dojoList = (dojos.data.data as Array<{ id: string }>) ?? [];
    if (!dojoList.some((d) => d.id === dojoId)) {
      return NextResponse.json({ error: "Dojo/Ranting tidak valid untuk cabang terpilih." }, { status: 400 });
    }

    const { res, data } = await inkaiFetch(
      "/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, fullName: name, dojoId }),
      },
      null,
    );

    if (!res.ok) {
      const msg = inkaiErrorMessage(data, "Pendaftaran gagal.");
      const status = res.status === 400 && msg.includes("terdaftar") ? 409 : res.status;
      return NextResponse.json({ error: msg }, { status });
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
