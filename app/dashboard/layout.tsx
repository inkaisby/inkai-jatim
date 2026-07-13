import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth/session";
import { getDashboardContext } from "@/lib/dashboard/context";
import { DashboardShell } from "./_components/dashboard-shell";

export const metadata: Metadata = {
  title: {
    template: "%s — Dashboard INKAI Jatim",
    default: "Dashboard — INKAI Jatim",
  },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/?login=1");

  const context = await getDashboardContext(user);

  return (
    <DashboardShell user={user} context={context}>
      {children}
    </DashboardShell>
  );
}
