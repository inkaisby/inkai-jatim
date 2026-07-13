import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasSessionSecret = Boolean(process.env.PORTAL_SESSION_SECRET);

  let dbOk = false;
  if (supabase) {
    const { error } = await supabase.from("Province").select("id", { count: "exact", head: true });
    dbOk = !error;
  }

  const ok = hasServiceRole && hasSessionSecret && dbOk;

  return NextResponse.json(
    {
      ok,
      checks: {
        serviceRole: hasServiceRole,
        sessionSecret: hasSessionSecret,
        database: dbOk,
      },
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
