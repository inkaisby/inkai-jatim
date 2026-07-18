"use client";

import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  onRefresh,
  refreshing,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Muat ulang
          </button>
        )}
      </div>
    </section>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card px-4 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function AdminMessage({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">{text}</p>
  );
}
