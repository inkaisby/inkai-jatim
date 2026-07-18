import type { Metadata } from "next";
import { Suspense } from "react";
import { GeofencingView } from "../../_components/geofencing-view";

export const metadata: Metadata = {
  title: "Geofencing Absensi",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <GeofencingView />
    </Suspense>
  );
}
