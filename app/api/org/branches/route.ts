import { NextResponse } from "next/server";
import { JATIM_PROVINCE_NAME } from "@/lib/portal/organization";
import { inkaiFetch } from "@/lib/inkai-api/server";

export async function GET() {
  const provinces = await inkaiFetch("/v1/org/provinces", {}, null);
  if (!provinces.res.ok) {
    return NextResponse.json({ error: "Gagal memuat provinsi" }, { status: 500 });
  }

  const provinceList = (provinces.data.data as Array<{ id: string; name: string }>) ?? [];
  const jatim = provinceList.find((p) => p.name.toUpperCase() === JATIM_PROVINCE_NAME);
  if (!jatim) {
    return NextResponse.json({ error: "Provinsi Jawa Timur tidak ditemukan." }, { status: 404 });
  }

  const branches = await inkaiFetch(`/v1/org/branches/${jatim.id}`, {}, null);
  if (!branches.res.ok) {
    return NextResponse.json({ error: branches.data.message ?? "Gagal memuat cabang" }, { status: 500 });
  }

  return NextResponse.json({ data: branches.data.data ?? [] });
}
