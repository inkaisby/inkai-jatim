import { getDojos } from "@/lib/portal/queries";
import { CardLink } from "../_components/card";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { EmptyState, ErrorState } from "../_components/states";

export const dynamic = "force-dynamic";

export default async function DojoPage() {
  const res = await getDojos(100);

  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "Portal" }, { href: "/dojo", label: "Dojo" }]} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dojo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Direktori dojo publik (read-only di Tahap 1).
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {res.ok ? (
          res.data.length ? (
            res.data.map((d) => (
              <CardLink key={d.id} href={`/dojo/${d.slug}`}>
                <div className="text-sm font-semibold">{d.name}</div>
                {d.address ? (
                  <div className="mt-2 text-sm text-muted-foreground">{d.address}</div>
                ) : (
                  <div className="mt-2 text-sm text-muted-foreground">(Alamat belum diisi)</div>
                )}
              </CardLink>
            ))
          ) : (
            <EmptyState text="Belum ada dojo publik." />
          )
        ) : (
          <ErrorState error={res.error} hint={res.hint} />
        )}
      </div>
    </main>
  );
}

