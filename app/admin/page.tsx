import type { Metadata } from "next";
import { DashboardHomeView } from "./_components/dashboard-home-view";

export const metadata: Metadata = {
  title: "Ringkasan",
};

export default function AdminPage() {
  return <DashboardHomeView />;
}
