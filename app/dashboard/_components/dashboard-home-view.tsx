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
} from "lucide-react";

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
          Dashboard Anggota
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          Ringkasan Wilayah{" "}
          <span className="text-gradient-accent">{context.roleLabel}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Kelola dan pantau data organisasi INKAI sesuai cakupan hierarki Provinsi →
          Cabang → Dojo/Ranting.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Provinsi" value={context.stats.provinces} icon={Landmark} />
        <StatCard title="Cabang" value={context.stats.branches} icon={MapPin} />
        <StatCard title="Dojo/Ranting" value={context.stats.dojos} icon={Building2} />
        <StatCard title="Anggota" value={context.stats.members} icon={Users} />
      </section>

      <HierarchyBanner hierarchy={context.hierarchy} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Dojo/Ranting dalam Cakupan</h2>
            <Link
              href="/dashboard/organisasi"
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
                      {dojo.address ?? "Alamat belum diisi"}
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
          </div>

          <div className="glass-card p-5">
            <div className="mb-3 inline-flex rounded-xl bg-muted p-2 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Aksi Cepat</h3>
            <div className="mt-3 space-y-2">
              <Link href="/dashboard/anggota" className="btn-outline w-full text-xs">
                Kelola Anggota
              </Link>
              <Link href="/dashboard/profil" className="btn-ghost w-full text-xs">
                Profil Akun
              </Link>
              <Link href="/" className="btn-ghost w-full text-xs">
                Portal Publik
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
