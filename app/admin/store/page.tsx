import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreView } from "../_components/store-view";

export const metadata: Metadata = {
  title: "Store",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <StoreView />
    </Suspense>
  );
}
