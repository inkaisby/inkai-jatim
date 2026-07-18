import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function POST(request: Request) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    memberIds?: string[];
    nia?: string;
    statusKind?: string;
  };

  const ids = Array.isArray(body.memberIds) ? body.memberIds.filter(Boolean) : [];
  if (!body.action || ids.length === 0) {
    return NextResponse.json({ error: "action dan memberIds wajib" }, { status: 400 });
  }

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const id of ids) {
    if (body.action === "approve" || body.action === "reject") {
      const { res, data } = await inkaiFetch(
        `/v1/members/${id}/registration`,
        {
          method: "PATCH",
          body: JSON.stringify({
            action: body.action,
            nia: body.nia,
          }),
        },
        token,
      );
      results.push({
        id,
        ok: res.ok,
        error: res.ok ? undefined : inkaiErrorMessage(data, "Gagal"),
      });
      continue;
    }

    if (body.action === "deactivate") {
      const { res, data } = await inkaiFetch(
        `/v1/members/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: body.statusKind === "SUSPENDED" ? "SUSPENDED" : "INACTIVE",
          }),
        },
        token,
      );
      results.push({
        id,
        ok: res.ok,
        error: res.ok ? undefined : inkaiErrorMessage(data, "Gagal"),
      });
      continue;
    }

    results.push({ id, ok: false, error: "Aksi tidak dikenali" });
  }

  const okCount = results.filter((r) => r.ok).length;
  return NextResponse.json({
    message: `${okCount}/${results.length} berhasil diproses`,
    data: results,
  });
}
