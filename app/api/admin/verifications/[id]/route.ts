import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    adminNotes?: string;
  };

  if (!body.status || !["APPROVED", "REJECTED"].includes(body.status)) {
    return NextResponse.json({ error: "status harus APPROVED atau REJECTED" }, { status: 400 });
  }

  const { res, data } = await inkaiFetch(
    `/v1/verifications/${id}/process`,
    {
      method: "POST",
      body: JSON.stringify({
        status: body.status,
        adminNotes: body.adminNotes ?? "",
      }),
    },
    token,
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal memproses klaim") },
      { status: res.status },
    );
  }

  return NextResponse.json({ data: data.data ?? null });
}
