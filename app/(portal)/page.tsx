import Link from "next/link";
import Image from "next/image";
import { getLatestPosts, getPinnedPosts, getUpcomingEvents } from "@/lib/portal/queries";
import { EmptyState, ErrorState } from "./_components/states";

export const dynamic = "force-dynamic";

export default function PortalHomePage() {
  return (
    <main>
      <div className="surface-muted p-8">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Image
                src="/logo-inkai.png"
                alt="Logo INKAI"
                width={24}
                height={24}
                className="rounded-full bg-card p-0.5 ring-1 ring-border shadow-sm"
              />
              <span>Portal INKAI Jatim</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Berita, agenda, dojo, dan dokumen
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Tahap 1 menampilkan konten publik (published + public). Konten internal dan
              login dibahas kemudian.
            </p>

            <div className="mt-6 hidden flex-col gap-3 sm:flex sm:flex-row">
              <Link className="btn-primary" href="/profil">
                Profil INKAI
              </Link>
              <Link className="btn-outline" href="/berita">
                Berita
              </Link>
              <Link className="btn-outline" href="/agenda">
                Agenda
              </Link>
              <Link className="btn-outline" href="/dojo">
                Dojo
              </Link>
              <Link className="btn-outline" href="/dokumen">
                Dokumen
              </Link>
            </div>
          </div>

          <div className="relative hidden shrink-0 lg:block">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-transparent to-background/40" />
            <Image
              src="/logo-inkai.png"
              alt=""
              width={180}
              height={180}
              className="select-none opacity-90 drop-shadow-sm"
              aria-hidden="true"
              priority
            />
          </div>
        </div>
      </div>

      <PortalHomeContent />
    </main>
  );
}

async function PortalHomeContent() {
  const [pinned, latest, upcoming] = await Promise.all([
    getPinnedPosts(3),
    getLatestPosts(6),
    getUpcomingEvents(5),
  ]);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-8">
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Pengumuman</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pinned posts (maks 3).</p>
            </div>
            <Link className="text-sm font-medium text-foreground hover:underline" href="/berita">
              Lihat semua
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pinned.ok ? (
              pinned.data.length ? (
                pinned.data.map((p) => (
                  <Link
                    key={p.id}
                    href={`/berita/${p.slug}`}
                    className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
                  >
                    <div className="text-sm font-semibold">{p.title}</div>
                    {p.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {p.excerpt}
                      </p>
                    ) : null}
                  </Link>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState text="Belum ada pengumuman pinned." />
                </div>
              )
            ) : (
              <div className="col-span-full">
                <ErrorState error={pinned.error} hint={pinned.hint} />
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Berita terbaru</h2>
              <p className="mt-1 text-sm text-muted-foreground">Konten publik terbaru.</p>
            </div>
            <Link className="text-sm font-medium text-foreground hover:underline" href="/berita">
              Lihat semua
            </Link>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {latest.ok ? (
              latest.data.length ? (
                latest.data.map((p) => (
                  <Link
                    key={p.id}
                    href={`/berita/${p.slug}`}
                    className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
                  >
                    <div className="text-sm font-semibold">{p.title}</div>
                    {p.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {p.excerpt}
                      </p>
                    ) : null}
                  </Link>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState text="Belum ada berita yang dipublish." />
                </div>
              )
            ) : (
              <div className="col-span-full">
                <ErrorState error={latest.error} hint={latest.hint} />
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="lg:col-span-4">
        <section className="lg:sticky lg:top-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Agenda terdekat</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Agenda publik yang akan datang.
              </p>
            </div>
            <Link className="text-sm font-medium text-foreground hover:underline" href="/agenda">
              Lihat semua
            </Link>
          </div>

          <div className="mt-4 grid gap-3">
            {upcoming.ok ? (
              upcoming.data.length ? (
                upcoming.data.map((e) => (
                  <Link
                    key={e.id}
                    href={`/agenda/${e.slug}`}
                    className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
                  >
                    <div className="text-sm font-semibold">{e.title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {new Date(e.start_at).toLocaleString("id-ID")}
                      {e.location_text ? ` • ${e.location_text}` : ""}
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState text="Belum ada agenda publik mendatang." />
              )
            ) : (
              <ErrorState error={upcoming.error} hint={upcoming.hint} />
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

