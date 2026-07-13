"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Network,
  UserCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { PortalSessionUser } from "@/lib/auth/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/organisasi", label: "Organisasi", icon: Network },
  { href: "/dashboard/anggota", label: "Anggota", icon: Users },
  { href: "/dashboard/profil", label: "Profil Akun", icon: UserCircle },
];

export function DashboardSidebar({
  user,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  user: PortalSessionUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`dashboard-sidebar flex h-full flex-col border-r border-border/70 bg-card/70 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
        <Image
          src="/logo-inkai.png"
          alt="Logo INKAI"
          width={36}
          height={36}
          className="rounded-full bg-background p-0.5 ring-1 ring-border"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              <span className="text-accent">INKAI</span> Dashboard
            </p>
            <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              Jawa Timur
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`dashboard-nav-item group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/60 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Kembali ke Portal</span>}
        </Link>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Ciutkan Sidebar</span>}
        </button>

        {!collapsed && (
          <div className="rounded-xl bg-muted/40 px-3 py-2.5">
            <p className="truncate text-xs font-semibold">{user.fullName ?? user.email}</p>
            <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
