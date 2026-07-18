import type { Metadata } from "next";
import { Suspense } from "react";
import { PeranView } from "../../_components/peran-view";

export const metadata: Metadata = {
  title: "Role & Hak Akses",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <PeranView />
    </Suspense>
  );
}
