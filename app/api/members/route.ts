import { NextResponse } from "next/server";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";

export async function GET(request: Request) {
  const token = await getInkaiTokenFromCookies();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const qs = new URLSearchParams();
  for (const key of ["status", "search", "branchId", "dojoId", "currentRank", "page", "limit"]) {
    const value = url.searchParams.get(key);
    if (value) qs.set(key, value);
  }
  if (!qs.has("limit")) qs.set("limit", "100");

  const { res, data } = await inkaiFetch(`/v1/members?${qs}`, {}, token);
  if (!res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal memuat anggota") },
      { status: res.status },
    );
  }

  const rows = (data.data as Array<Record<string, unknown>>) ?? [];
  const items = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    email: (row.user as { email?: string } | undefined)?.email ?? null,
    nia: row.nia ?? null,
    currentRank: row.currentRank ?? null,
    status: row.status,
    profileStatus:
      row.status === "PENDING"
        ? "pending"
        : row.status === "REJECTED"
          ? "rejected"
          : "approved",
    dojoId: row.dojoId,
    dojoName: (row.dojo as { name?: string } | undefined)?.name ?? null,
    branchName: (row.dojo as { branch?: { name?: string } } | undefined)?.branch?.name ?? null,
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ data: items, meta: data.meta ?? null });
}
