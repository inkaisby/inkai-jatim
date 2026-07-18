import type { Metadata } from "next";
import { Suspense } from "react";
import { KebijakanView } from "../../_components/kebijakan-view";

export const metadata: Metadata = {
  title: "Profil & Kebijakan",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <KebijakanView />
    </Suspense>
  );
}
