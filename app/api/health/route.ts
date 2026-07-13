import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { getPortalSessionSecret, getSupabaseServiceRoleKey } from "@/lib/supabase/env";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const hasServiceRole = Boolean(getSupabaseServiceRoleKey());
  const hasSessionSecret = Boolean(getPortalSessionSecret());

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
