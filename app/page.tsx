import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="surface-muted p-8">
          <p className="text-sm font-medium text-muted-foreground">
            INKAI Jawa Timur
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Portal resmi berita, agenda, dojo, dan dokumen
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            Portal publik berada di <span className="font-mono">/portal</span>.
            Halaman login dan konten internal dibahas di tahap berikutnya.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn-primary"
              href="/portal"
            >
              Buka Portal
            </Link>
            <Link
              className="btn-outline"
              href="/portal/berita"
            >
              Lihat Berita
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
