/**
 * Apply data-only fixes via Supabase service role (no DDL).
 * Usage: npm run db:seed-permissions
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: role } = await supabase.from("Role").select("id").eq("name", "ADMIN_DOJO").single();
  const { data: perms } = await supabase
    .from("Permission")
    .select("id, slug")
    .in("slug", ["dashboard", "members", "verification"]);

  if (!role || !perms?.length) {
    console.error("Role ADMIN_DOJO or permissions not found");
    process.exit(1);
  }

  for (const perm of perms) {
    const { error } = await supabase.from("RolePermission").upsert(
      { roleId: role.id, permissionId: perm.id },
      { onConflict: "roleId,permissionId", ignoreDuplicates: true },
    );
    if (error) {
      const { error: insertError } = await supabase
        .from("RolePermission")
        .insert({ roleId: role.id, permissionId: perm.id });
      if (insertError && !insertError.message.includes("duplicate")) {
        console.warn(perm.slug, insertError.message);
      }
    } else {
      console.log("permission linked:", perm.slug);
    }
  }

  console.log("Done.");
}

main();
