import type { Metadata } from "next";
import { Suspense } from "react";
import { MateriView } from "../_components/materi-view";

export const metadata: Metadata = {
  title: "Materi Digital",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <MateriView />
    </Suspense>
  );
}
