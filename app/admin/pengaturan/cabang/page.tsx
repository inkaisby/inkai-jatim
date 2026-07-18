import type { Metadata } from "next";
import { Suspense } from "react";
import { CabangView } from "../../_components/cabang-view";

export const metadata: Metadata = {
  title: "Pengaturan Cabang",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <CabangView />
    </Suspense>
  );
}
