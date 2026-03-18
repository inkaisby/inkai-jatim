import { notFound } from "next/navigation";
import { getDojoBySlug } from "@/lib/portal/queries";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { BackLink } from "../../_components/back-link";
import { ErrorState } from "../../_components/states";

export const dynamic = "force-dynamic";

export default async function DojoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getDojoBySlug(slug);

  if (res.ok && !res.data) notFound();

  return (
    <main>
      <Breadcrumbs items={[{ href: "/", label: "Portal" }, { href: "/dojo", label: "Dojo" }]} />
      <div className="mb-6">
        <BackLink href="/dojo" label="Kembali ke Dojo" />
      </div>

      {res.ok ? (
        res.data ? (
          <article className="surface p-8">
            <h1 className="text-3xl font-semibold tracking-tight">{res.data.name}</h1>
            {res.data.address ? (
              <p className="mt-4 text-sm text-muted-foreground">{res.data.address}</p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">(Alamat belum diisi.)</p>
            )}
          </article>
        ) : null
      ) : (
        <ErrorState error={res.error} hint={res.hint} />
      )}
    </main>
  );
}

