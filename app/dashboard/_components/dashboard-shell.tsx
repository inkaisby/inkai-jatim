"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { PortalSessionUser } from "@/lib/auth/types";
import type { HierarchyNode } from "@/lib/dashboard/context";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { DashboardFooter } from "./dashboard-footer";

export function DashboardShell({
  user,
  roleLabel,
  hierarchy,
  children,
}: {
  user: PortalSessionUser;
  roleLabel: string;
  hierarchy: HierarchyNode[];
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-root min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <div className="hidden lg:block shrink-0">
          <div className="fixed inset-y-0 left-0 z-30">
            <DashboardSidebar
              user={user}
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((prev) => !prev)}
            />
          </div>
          <div className={collapsed ? "w-[76px]" : "w-64"} aria-hidden />
        </div>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            user={user}
            collapsed={false}
            onToggleCollapse={() => setSidebarOpen(false)}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar
            user={user}
            roleLabel={roleLabel}
            hierarchy={hierarchy}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6 animate-fade-in-up">
            {children}
          </main>

          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
