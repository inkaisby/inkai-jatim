import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditView } from "../_components/audit-view";

export const metadata: Metadata = {
  title: "Log Audit",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <AuditView />
    </Suspense>
  );
}
