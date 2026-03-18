import { getLatestPosts } from "@/lib/portal/queries";
import { CardLink } from "../_components/card";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { EmptyState, ErrorState } from "../_components/states";

export const dynamic = "force-dynamic";

export default async function BeritaPage() {
  const res = await getLatestPosts(30);

  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "Portal" }, { href: "/berita", label: "Berita" }]} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Berita</h1>
          <p className="mt-1 text-sm text-muted-foreground">Konten publik yang sudah dipublish.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {res.ok ? (
          res.data.length ? (
            res.data.map((p) => (
              <CardLink key={p.id} href={`/berita/${p.slug}`}>
                <div className="text-sm font-semibold">{p.title}</div>
                {p.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                ) : null}
                <div className="mt-2 text-xs text-muted-foreground">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString("id-ID") : ""}
                </div>
              </CardLink>
            ))
          ) : (
            <EmptyState text="Belum ada berita yang dipublish." />
          )
        ) : (
          <ErrorState error={res.error} hint={res.hint} />
        )}
      </div>
    </main>
  );
}

