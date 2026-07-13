import { getSessionUser } from "@/lib/auth/session";
import { getUserPermissionSlugs, canVerifyMembers } from "@/lib/auth/permissions";
import { MembersPanel } from "../_components/members-panel";

export default async function DashboardAnggotaPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const permissions = await getUserPermissionSlugs(user.id);
  const canVerify = canVerifyMembers(user, permissions);

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in-up">
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Anggota</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kelola dan verifikasi anggota sesuai cakupan wilayah RBAC Anda.
        </p>
      </section>

      <MembersPanel canVerify={canVerify} />
    </div>
  );
}
