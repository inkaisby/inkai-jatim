import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/portal/queries";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { BackLink } from "../../_components/back-link";
import { ErrorState } from "../../_components/states";

export const dynamic = "force-dynamic";

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await getPostBySlug(slug);

  if (res.ok && !res.data) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[
          { href: "/portal", label: "Portal" },
          { href: "/portal/berita", label: "Berita" },
        ]}
      />
      <div className="mb-6">
        <BackLink href="/portal/berita" label="Kembali ke Berita" />
      </div>

      {res.ok ? (
        res.data ? (
          <article className="surface p-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              {res.data.title}
            </h1>
            <div className="mt-2 text-sm text-muted-foreground">
              {res.data.published_at
                ? new Date(res.data.published_at).toLocaleString("id-ID")
                : ""}
            </div>
            {res.data.excerpt ? (
              <p className="mt-5 text-base text-muted-foreground">
                {res.data.excerpt}
              </p>
            ) : null}
            {res.data.content ? (
              <div className="prose prose-zinc mt-6 max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
                  {res.data.content}
                </pre>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                (Konten belum diisi.)
              </p>
            )}
          </article>
        ) : null
      ) : (
        <ErrorState error={res.error} hint={res.hint} />
      )}
    </main>
  );
}

