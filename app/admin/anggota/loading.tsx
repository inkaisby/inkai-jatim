export default function AdminAnggotaLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
      <section className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full rounded bg-muted/70" />
      </section>
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-muted/60" />
          ))}
        </div>
        <div className="glass-card space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
