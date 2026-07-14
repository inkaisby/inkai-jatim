import { NextResponse } from "next/server";
import { getInkaiApiBaseUrl } from "@/lib/inkai-api/server";

export async function GET() {
  try {
    const base = getInkaiApiBaseUrl();
    const res = await fetch(`${base}/health/db`, { cache: "no-store" });
    return NextResponse.json({
      ok: res.ok,
      checks: {
        api: true,
        database: res.ok,
      },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        checks: { api: false, database: false },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
