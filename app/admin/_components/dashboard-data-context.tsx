"use client";

import { createContext, useContext } from "react";
import type { PortalSessionUser } from "@/lib/auth/types";
import type { DashboardContext } from "@/lib/dashboard/context";

type DashboardData = DashboardContext & { user: PortalSessionUser };

const DashboardDataContext = createContext<DashboardData | null>(null);

export function DashboardDataProvider({
  value,
  children,
}: {
  value: DashboardData;
  children: React.ReactNode;
}) {
  return (
    <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }
  return ctx;
}
