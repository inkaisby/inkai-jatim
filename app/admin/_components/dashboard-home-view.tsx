"use client";

import Link from "next/link";
import { useDashboardData } from "./dashboard-data-context";
import { StatCard } from "./stat-card";
import { HierarchyBanner } from "./hierarchy-banner";
import {
  Users,
  Building2,
  MapPin,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Megaphone,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

const EXEC_LINKS = [
  { href: "/admin/anggota", label: "Kelola Anggota", icon: Users },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: ShieldCheck },
  { href: "/admin/organisasi", label: "Organisasi", icon: Building2 },
  { href: "/admin/iuran", label: "Iuran Anggota", icon: MapPin },
  { href: "/admin/ukt", label: "UKT", icon: Landmark },
  { href: "/admin/kegiatan", label: "Event & Kegiatan", icon: CalendarDays },
  { href: "/admin/pesan", label: "Pesan / Broadcast", icon: Megaphone },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Clock3 },
];

export function DashboardHomeView() {
  const context = useDashboardData();

  const statusLabel =
    context.profileStatus === "pending"
      ? "Menunggu Verifikasi"
      : context.profileStatus === "rejected"
        ? "Ditolak"
        : context.profileStatus === "approved"
          ? "Aktif"
          : context.memberStatus ?? "Terdaftar";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Admin Pengprov Jawa Timur
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          Ringkasan Wilayah{" "}
          <span className="text-gradient-accent">{context.roleLabel}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pantau kesehatan organisasi INKAI se-Jawa Timur: cabang, dojo, anggota, dan antrian
          verifikasi — selaras Inkai API (inkai-backend).
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Cabang" value={context.stats.branches} icon={MapPin} />
        <StatCard title="Dojo/Ranting" value={context.stats.dojos} icon={Building2} />
        <StatCard title="Anggota" value={context.stats.members} icon={Users} />
        <StatCard
          title="Pending Verifikasi"
          value={context.stats.pendingVerifications}
          icon={AlertCircle}
        />
        <StatCard
          title="Iuran Lunas (Rp)"
          value={Number(context.stats.iuranTotal || 0).toLocaleString("id-ID")}
          icon={Landmark}
        />
      </section>

      <HierarchyBanner hierarchy={context.hierarchy} />

      <section className="glass-card p-5">
        <h2 className="mb-4 text-base font-semibold">Menu Eksekutif</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXEC_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background/50 px-4 py-3 transition-colors hover:border-accent/30 hover:bg-accent/5"
              >
                <span className="inline-flex rounded-xl bg-accent/10 p-2 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{item.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Dojo/Ranting dalam Cakupan</h2>
            <Link
              href="/admin/organisasi"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              Lihat semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {context.recentDojos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada data dojo/ranting pada cakupan akun ini.
            </p>
          ) : (
            <div className="space-y-2">
              {context.recentDojos.map((dojo) => (
                <div
                  key={dojo.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background/50 px-4 py-3 transition-colors hover:border-accent/25"
                >
                  <div>
                    <p className="text-sm font-semibold">{dojo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[dojo.branchName, dojo.address ?? "Alamat belum diisi"]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <Building2 className="h-4 w-4 text-accent/70" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="mb-3 inline-flex rounded-xl bg-accent/10 p-2 text-accent">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Status Akun Portal</h3>
            <p className="mt-2 text-2xl font-bold">{statusLabel}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Role: <strong className="text-foreground">{context.roleLabel}</strong>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Provinsi cakupan: <strong className="text-foreground">JAWA TIMUR</strong>
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="mb-3 inline-flex rounded-xl bg-muted p-2 text-muted-foreground">
              <Landmark className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">KPI Cabang Teratas</h3>
            <div className="mt-3 space-y-2">
              {context.branches.slice(0, 4).map((branch) => (
                <div key={branch.id} className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium">{branch.name}</span>
                  <span className="text-muted-foreground">
                    {branch.dojoCount} dojo · {branch.memberCount} anggota
                  </span>
                </div>
              ))}
              {context.branches.length === 0 && (
                <p className="text-xs text-muted-foreground">Belum ada data cabang.</p>
              )}
              <Link href="/admin/pengaturan/cabang" className="btn-outline mt-2 w-full text-xs">
                Lihat semua cabang
              </Link>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-3 inline-flex rounded-xl bg-muted p-2 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Aksi Cepat</h3>
            <div className="mt-3 space-y-2">
              <Link href="/admin/verifikasi" className="btn-outline w-full text-xs">
                Antrian Verifikasi ({context.stats.pendingVerifications})
              </Link>
              <Link href="/admin/anggota" className="btn-ghost w-full text-xs">
                Kelola Anggota
              </Link>
              <Link href="/admin/pengaturan" className="btn-ghost w-full text-xs">
                Pengaturan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
