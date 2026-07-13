import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guard";
import { listMembersInScope } from "@/lib/members/queries";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;

  const result = await listMembersInScope(auth.ctx.user, { status });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
