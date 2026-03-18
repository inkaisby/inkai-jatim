export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function ErrorState({ error, hint }: { error: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
      <div className="font-semibold">Belum terhubung data</div>
      <div className="mt-1">{error}</div>
      {hint ? <div className="mt-2 text-amber-900">{hint}</div> : null}
    </div>
  );
}

