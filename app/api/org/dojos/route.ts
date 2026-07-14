import { NextResponse } from "next/server";
import { inkaiFetch } from "@/lib/inkai-api/server";

export async function GET(request: Request) {
  const branchId = new URL(request.url).searchParams.get("branchId")?.trim();
  if (!branchId) {
    return NextResponse.json({ error: "branchId wajib diisi." }, { status: 400 });
  }

  const { res, data } = await inkaiFetch(`/v1/org/dojos/${branchId}`, {}, null);
  if (!res.ok) {
    return NextResponse.json({ error: "Gagal memuat dojo" }, { status: res.status });
  }

  return NextResponse.json({ data: data.data ?? [] });
}
