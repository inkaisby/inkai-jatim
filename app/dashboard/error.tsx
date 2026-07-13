"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold">Gagal memuat dashboard</h2>
      <p className="text-sm text-muted-foreground">
        Terjadi kesalahan saat mengambil data. Periksa koneksi internet Anda lalu coba lagi.
      </p>
      <button type="button" onClick={reset} className="btn-outline text-sm">
        Coba lagi
      </button>
    </div>
  );
}
