"use client";

import { Menu, Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import type { PortalSessionUser } from "@/lib/auth/types";
import type { HierarchyNode } from "@/lib/dashboard/context";

export function DashboardTopbar({
  user,
  roleLabel,
  hierarchy,
  onOpenSidebar,
}: {
  user: PortalSessionUser;
  roleLabel: string;
  hierarchy: HierarchyNode[];
  onOpenSidebar: () => void;
}) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="dashboard-topbar sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-foreground transition-all hover:bg-muted lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 animate-fade-in">
            <p className="truncate text-sm font-semibold md:text-base">
              Selamat datang, {user.fullName ?? user.email.split("@")[0]}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
              {hierarchy.map((node, index) => (
                <span key={`${node.level}-${node.id ?? node.name}`} className="inline-flex items-center">
                  {index > 0 && <span className="mx-1 opacity-50">›</span>}
                  <span className={index === hierarchy.length - 1 ? "font-medium text-foreground/80" : ""}>
                    {node.name}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent md:inline-flex">
            {roleLabel}
          </span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition-all hover:text-foreground"
            aria-label="Notifikasi"
          >
            <Bell className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 text-xs font-semibold text-muted-foreground transition-all hover:border-destructive/30 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
