import { getUpcomingEvents } from "@/lib/portal/queries";
import { CardLink } from "../_components/card";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { EmptyState, ErrorState } from "../_components/states";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const res = await getUpcomingEvents(50);

  return (
    <main>
      <Breadcrumbs
        items={[
          { href: "/portal", label: "Portal" },
          { href: "/portal/agenda", label: "Agenda" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agenda publik yang akan datang.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        {res.ok ? (
          res.data.length ? (
            res.data.map((e) => (
              <CardLink
                key={e.id}
                href={`/portal/agenda/${e.slug}`}
              >
                <div className="text-sm font-semibold">{e.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {new Date(e.start_at).toLocaleString("id-ID")}
                  {e.location_text ? ` • ${e.location_text}` : ""}
                </div>
              </CardLink>
            ))
          ) : (
            <EmptyState text="Belum ada agenda publik mendatang." />
          )
        ) : (
          <ErrorState error={res.error} hint={res.hint} />
        )}
      </div>
    </main>
  );
}

