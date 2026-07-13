import { NextResponse } from "next/server";
import { getDojosByBranchId } from "@/lib/portal/organization";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId");

  if (!branchId) {
    return NextResponse.json({ error: "branchId wajib diisi." }, { status: 400 });
  }

  const result = await getDojosByBranchId(branchId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
