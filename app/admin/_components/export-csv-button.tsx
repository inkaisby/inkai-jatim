"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv";

export function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Export CSV",
}: {
  filename: string;
  headers: string[];
  rows: Array<Array<string | number | null | undefined>>;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, headers, rows)}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
