"use client";

import Link from "next/link";
import {
  Users,
  MapPin,
  Network,
  Shield,
  Settings2,
  UserCircle,
  MapPinned,
  BookOpen,
} from "lucide-react";
import { useDashboardData } from "./dashboard-data-context";
import { AdminPageHeader } from "./admin-ui";
import { HierarchyBanner } from "./hierarchy-banner";

const HUB = [
  {
    group: "Akun",
    items: [
      { href: "/admin/pengaturan/akun", label: "Akun Saya", desc: "Profil & keamanan login", icon: UserCircle },
      { href: "/admin/pengaturan/user", label: "Pengaturan User", desc: "Akun admin dalam cakupan", icon: Users },
    ],
  },
  {
    group: "Wilayah",
    items: [
      { href: "/admin/pengaturan/cabang", label: "Pengaturan Cabang", desc: "Direktori & KPI Pengcab", icon: MapPin },
      { href: "/admin/pengaturan/ranting", label: "Pengaturan Ranting", desc: "Dojo/ranting se-Jatim", icon: Network },
      { href: "/admin/pengaturan/geofencing", label: "Geofencing Absensi", desc: "Koordinat & radius dojo", icon: MapPinned },
    ],
  },
  {
    group: "Kebijakan",
    items: [
      { href: "/admin/pengaturan/kebijakan", label: "Profil & Kebijakan", desc: "Identitas Pengprov", icon: BookOpen },
      { href: "/admin/pengaturan/peran", label: "Role & Hak Akses", desc: "Matriks permission", icon: Shield },
    ],
  },
];

export function PengaturanHubView() {
  const context = useDashboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        eyebrow="Sistem"
        title="Ringkasan Pengaturan"
        description="Pusat konfigurasi admin Pengprov Jawa Timur — struktur menu selaras inkai-sby."
      />
      <HierarchyBanner hierarchy={context.hierarchy} />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Cabang</p>
          <p className="mt-1 text-2xl font-bold">{context.stats.branches}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Dojo</p>
          <p className="mt-1 text-2xl font-bold">{context.stats.dojos}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Anggota</p>
          <p className="mt-1 text-2xl font-bold">{context.stats.members}</p>
        </div>
      </section>

      {HUB.map((section) => (
        <section key={section.group} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Settings2 className="h-4 w-4" />
            {section.group}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="glass-card flex items-start gap-3 p-4 transition-colors hover:border-accent/30"
                >
                  <span className="inline-flex rounded-xl bg-accent/10 p-2 text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
