import type { Metadata } from "next";
import { Suspense } from "react";
import { UktView } from "../_components/ukt-view";

export const metadata: Metadata = {
  title: "UKT",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <UktView />
    </Suspense>
  );
}
