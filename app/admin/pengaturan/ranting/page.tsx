import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganisasiView } from "../../_components/organisasi-view";

export const metadata: Metadata = {
  title: "Pengaturan Ranting",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <OrganisasiView />
    </Suspense>
  );
}
