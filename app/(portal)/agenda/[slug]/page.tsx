import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/portal/queries";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { BackLink } from "../../_components/back-link";
import { ErrorState } from "../../_components/states";

export const dynamic = "force-dynamic";

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getEventBySlug(slug);

  if (res.ok && !res.data) notFound();

  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "Portal" }, { href: "/agenda", label: "Agenda" }]} />
      <div className="mb-6">
        <BackLink href="/agenda" label="Kembali ke Agenda" />
      </div>

      {res.ok ? (
        res.data ? (
          <article className="surface p-8">
            <h1 className="text-3xl font-semibold tracking-tight">{res.data.title}</h1>
            <div className="mt-2 text-sm text-muted-foreground">
              {new Date(res.data.start_at).toLocaleString("id-ID")}
              {res.data.end_at ? ` – ${new Date(res.data.end_at).toLocaleString("id-ID")}` : ""}
            </div>
            {res.data.location_text ? (
              <div className="mt-4 text-sm text-muted-foreground">
                Lokasi: {res.data.location_text}
              </div>
            ) : null}
            {res.data.type ? (
              <div className="mt-2 text-sm text-muted-foreground">Jenis: {res.data.type}</div>
            ) : null}
          </article>
        ) : null
      ) : (
        <ErrorState error={res.error} hint={res.hint} />
      )}
    </main>
  );
}

