import type { Metadata } from "next";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth/session";
import { getUserPermissionSlugs, canVerifyMembers } from "@/lib/auth/permissions";
import { listMembersInScope } from "@/lib/members/queries";
import { MembersPanel } from "../_components/members-panel";

export const metadata: Metadata = {
  title: "Anggota",
};

export default async function AdminAnggotaPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [permissions, membersResult] = await Promise.all([
    getUserPermissionSlugs(user.id),
    listMembersInScope(user, { limit: 200 }),
  ]);

  const canVerify = canVerifyMembers(user, permissions);
  const initialMembers = membersResult.ok ? membersResult.data : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Anggota</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Database anggota se-Jawa Timur: cari, filter cabang, verifikasi pending, dan export CSV.
        </p>
      </section>

      <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat anggota...</div>}>
        <MembersPanel
          canVerify={canVerify}
          initialMembers={initialMembers}
          initialError={membersResult.ok ? null : membersResult.error}
        />
      </Suspense>
    </div>
  );
}
