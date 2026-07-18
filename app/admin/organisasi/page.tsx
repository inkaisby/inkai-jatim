import type { Metadata } from "next";
import { Suspense } from "react";
import { OrganisasiView } from "../_components/organisasi-view";

export const metadata: Metadata = {
  title: "Dojo / Ranting",
};

export default function AdminOrganisasiPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat organisasi...</div>}>
      <OrganisasiView />
    </Suspense>
  );
}
