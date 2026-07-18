import type { Metadata } from "next";
import { Suspense } from "react";
import { NotifikasiView } from "../_components/notifikasi-view";

export const metadata: Metadata = {
  title: "Notifikasi",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <NotifikasiView />
    </Suspense>
  );
}
