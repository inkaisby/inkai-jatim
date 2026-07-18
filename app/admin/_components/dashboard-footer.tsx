export function DashboardFooter() {
  return (
    <footer className="dashboard-footer mt-auto border-t border-border/60 bg-card/40 px-4 py-4 md:px-6">
      <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} INKAI Jawa Timur — Portal Anggota</p>
        <p className="font-medium tracking-wide">Integritas • Disiplin • Prestasi</p>
      </div>
    </footer>
  );
}
