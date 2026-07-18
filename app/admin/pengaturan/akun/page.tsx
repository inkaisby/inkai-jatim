import type { Metadata } from "next";
import { Suspense } from "react";
import { AkunSayaView } from "../../_components/akun-saya-view";

export const metadata: Metadata = {
  title: "Akun Saya",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <AkunSayaView />
    </Suspense>
  );
}
