import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

/** Generate tagihan iuran bulanan untuk anggota aktif dalam cakupan. */
export async function POST(request: Request) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    year?: number;
    month?: number;
    amount?: number;
    dryRun?: boolean;
  };

  const now = new Date();
  const year = Number(body.year) || now.getFullYear();
  const month = Number(body.month) || now.getMonth() + 1;
  const amount = Number(body.amount) || 50000;
  const dryRun = Boolean(body.dryRun);
  const periodKey = `${year}-${String(month).padStart(2, "0")}`;

  const membersRes = await inkaiFetch(
    "/v1/members?status=Active&limit=500",
    {},
    token,
  );
  if (!membersRes.res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(membersRes.data, "Gagal memuat anggota") },
      { status: membersRes.res.status },
    );
  }

  const members = (membersRes.data.data as Array<{ id: string; fullName?: string }>) ?? [];

  const billingRes = await inkaiFetch("/v1/billing?limit=500&type=MONTHLY_IURAN", {}, token);
  const existing = billingRes.res.ok
    ? ((billingRes.data.data as Array<{ memberId?: string; description?: string; type?: string }>) ?? [])
    : [];

  const already = new Set(
    existing
      .filter((b) => String(b.description ?? "").includes(periodKey) || String(b.type ?? "").includes("MONTHLY"))
      .map((b) => b.memberId)
      .filter(Boolean),
  );

  const dueDate = new Date(year, month, 0).toISOString();
  const candidates = members.filter((m) => !already.has(m.id)).slice(0, 200);

  if (dryRun) {
    return NextResponse.json({
      message: `Dry-run: ${candidates.length} tagihan akan dibuat untuk ${periodKey}`,
      data: { periodKey, count: candidates.length, amount },
    });
  }

  let created = 0;
  const errors: string[] = [];
  for (const member of candidates) {
    const { res, data } = await inkaiFetch(
      "/v1/billing",
      {
        method: "POST",
        body: JSON.stringify({
          memberId: member.id,
          type: "MONTHLY_IURAN",
          amount,
          dueDate,
          description: `Iuran bulanan ${periodKey}`,
        }),
      },
      token,
    );
    if (res.ok) created += 1;
    else errors.push(`${member.fullName ?? member.id}: ${inkaiErrorMessage(data, "gagal")}`);
  }

  return NextResponse.json({
    message: `Berhasil membuat ${created} tagihan iuran ${periodKey}`,
    data: { periodKey, created, skipped: members.length - candidates.length, errors: errors.slice(0, 10) },
  });
}
