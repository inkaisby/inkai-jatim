import { NextResponse } from "next/server";
import { getJatimBranches } from "@/lib/portal/organization";

export async function GET() {
  const result = await getJatimBranches();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
