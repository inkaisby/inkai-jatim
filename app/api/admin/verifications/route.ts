import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function GET() {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { res, data } = await inkaiFetch("/v1/verifications/pending", {}, token);
  if (!res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal memuat verifikasi") },
      { status: res.status },
    );
  }

  return NextResponse.json({ data: data.data ?? [] });
}
