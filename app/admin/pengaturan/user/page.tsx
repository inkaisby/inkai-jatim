import type { Metadata } from "next";
import { Suspense } from "react";
import { UserSettingsView } from "../../_components/user-settings-view";

export const metadata: Metadata = {
  title: "Pengaturan User",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
      <UserSettingsView />
    </Suspense>
  );
}
