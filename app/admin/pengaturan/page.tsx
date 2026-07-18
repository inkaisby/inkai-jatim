import type { Metadata } from "next";
import { Suspense } from "react";
import { PengaturanHubView } from "../_components/pengaturan-hub-view";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <PengaturanHubView />
    </Suspense>
  );
}
