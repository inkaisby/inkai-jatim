import type { Metadata } from "next";
import { Suspense } from "react";
import { PesanView } from "../_components/pesan-view";

export const metadata: Metadata = {
  title: "Pesan",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <PesanView />
    </Suspense>
  );
}
