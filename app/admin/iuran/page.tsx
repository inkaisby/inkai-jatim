import type { Metadata } from "next";
import { Suspense } from "react";
import { IuranView } from "../_components/iuran-view";

export const metadata: Metadata = {
  title: "Iuran Anggota",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <IuranView />
    </Suspense>
  );
}
