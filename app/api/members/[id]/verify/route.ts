import { NextResponse } from "next/server";
import { requireMemberVerifier } from "@/lib/auth/guard";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberVerifier();
  if (!auth.ok) return auth.response;

  const token = auth.ctx.token;
  if (!token) {
    return NextResponse.json({ error: "Token tidak tersedia" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { action?: "approve" | "reject" };

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "action harus approve atau reject." }, { status: 400 });
  }

  const { res, data } = await inkaiFetch(
    `/v1/members/${id}/registration`,
    {
      method: "PATCH",
      body: JSON.stringify({ action: body.action }),
    },
    token,
  );

  if (!res.ok) {
    const status = res.status === 403 ? 403 : 400;
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal memverifikasi anggota") },
      { status },
    );
  }

  const payload = data.data as { status?: string } | undefined;
  const profileStatus =
    payload?.status === "Active"
      ? "approved"
      : payload?.status === "REJECTED"
        ? "rejected"
        : "pending";

  return NextResponse.json({ ok: true, status: profileStatus });
}
