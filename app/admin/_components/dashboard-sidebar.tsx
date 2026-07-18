"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { PortalSessionUser } from "@/lib/auth/types";
import {
  getAdminNavLinks,
  isNavGroup,
  isActivePath,
  type NavItem,
} from "@/lib/admin-nav";

function NavGroupBlock({
  item,
  pathname,
  collapsed,
  onNavigate,
  badges,
}: {
  item: Extract<NavItem, { children: unknown }>;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
  badges: Record<string, number>;
}) {
  const childActive = item.children.some((c) => isActivePath(pathname, c.href));
  const [open, setOpen] = useState(childActive);

  return (
    <div className="space-y-1">
      {!collapsed && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90 hover:bg-muted/50"
        >
          <span>{item.label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
      {(collapsed || open) &&
        item.children.map((child) => {
          const active = isActivePath(pathname, child.href);
          const badge = badges[child.href] || 0;
          return (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              title={collapsed ? child.label : undefined}
              className={`dashboard-nav-item flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {!collapsed && (
                <>
                  <span className="truncate">{child.label}</span>
                  {badge > 0 && (
                    <span className="ml-auto rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && (
                <span className="mx-auto text-[10px] font-bold">
                  {child.label.slice(0, 2).toUpperCase()}
                </span>
              )}
            </Link>
          );
        })}
    </div>
  );
}

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
  const items = useMemo(() => getAdminNavLinks(user.roles), [user.roles]);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadBadges() {
      try {
        const [notifRes, verRes] = await Promise.all([
          fetch("/api/admin/notifications"),
          fetch("/api/admin/verifications"),
        ]);
        const notifJson = (await notifRes.json()) as {
          data?: Array<{ isRead?: boolean }>;
        };
        const verJson = (await verRes.json()) as { data?: unknown[] };
        const unread = Array.isArray(notifJson.data)
          ? notifJson.data.filter((n) => !n.isRead).length
          : 0;
        const pending = Array.isArray(verJson.data) ? verJson.data.length : 0;
        if (!cancelled) {
          setBadges({
            "/admin/notifikasi": unread,
            "/admin/pesan": unread,
            "/admin/verifikasi": pending,
          });
        }
      } catch {
        /* ignore */
      }
    }
    void loadBadges();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

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
              <span className="text-accent">INKAI</span> Admin
            </p>
            <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              Pengprov Jawa Timur
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto p-3">
        {items.map((item) => {
          if (isNavGroup(item)) {
            return (
              <NavGroupBlock
                key={item.label}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={onNavigate}
                badges={badges}
              />
            );
          }

          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`dashboard-nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {!collapsed ? (
                <span>{item.label}</span>
              ) : (
                <span className="mx-auto text-[10px] font-bold">BA</span>
              )}
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
          className="hidden w-full items-center justify-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground lg:flex"
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
