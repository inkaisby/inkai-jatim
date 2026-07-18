import type { Metadata } from "next";
import { Suspense } from "react";
import { AbsensiView } from "../_components/absensi-view";

export const metadata: Metadata = {
  title: "Absensi",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <AbsensiView />
    </Suspense>
  );
}
