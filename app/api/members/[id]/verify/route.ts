import { NextResponse } from "next/server";
import { requireMemberVerifier } from "@/lib/auth/guard";
import { verifyMemberInScope } from "@/lib/members/queries";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireMemberVerifier();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = (await request.json()) as { action?: "approve" | "reject" };

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "action harus approve atau reject." }, { status: 400 });
  }

  const result = await verifyMemberInScope(auth.ctx.user, id, body.action);
  if (!result.ok) {
    const status = result.error.includes("Forbidden") ? 403 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
