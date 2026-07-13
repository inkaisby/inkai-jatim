import { getSessionUser } from "@/lib/auth/session";
import { getDashboardContext } from "@/lib/dashboard/context";
import { getPrimaryRoleLabel } from "@/lib/dashboard/labels";
import { Mail, Shield, UserCircle } from "lucide-react";

export default async function DashboardProfilPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const context = await getDashboardContext(user);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profil Akun</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informasi akun portal dan cakupan RBAC Anda.
        </p>
      </section>

      <div className="glass-card overflow-hidden p-0">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent/10 p-3 text-accent">
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{user.fullName ?? "Nama belum diisi"}</p>
              <p className="text-xs text-muted-foreground">{getPrimaryRoleLabel(user.roles)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start gap-3 rounded-xl border border-border/70 p-4">
            <Mail className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </p>
              <p className="mt-1 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 p-4">
            <Shield className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role & Status
              </p>
              <p className="mt-1 text-sm">
                {user.roles.join(", ") || "MEMBER"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Status portal: {context.profileStatus ?? "—"} • Status anggota:{" "}
                {context.memberStatus ?? "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hierarki Cakupan
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {context.hierarchy.map((node) => (
                <li key={`${node.level}-${node.name}`}>• {node.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
