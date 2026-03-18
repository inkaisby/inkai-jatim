import Link from "next/link";
import { getDocuments } from "@/lib/portal/queries";
import { Card } from "../_components/card";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { EmptyState, ErrorState } from "../_components/states";

export const dynamic = "force-dynamic";

export default async function DokumenPage() {
  const res = await getDocuments(100);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main>
      <Breadcrumbs
        items={[
          { href: "/portal", label: "Portal" },
          { href: "/portal/dokumen", label: "Dokumen" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dokumen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar dokumen publik. File diambil dari bucket{" "}
          <span className="font-mono">portal-public</span>.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        {res.ok ? (
          res.data.length ? (
            res.data.map((d) => (
              <Card key={d.id}>
                <div className="text-sm font-semibold">{d.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {d.version_label ? `Versi: ${d.version_label}` : ""}
                  {d.published_at
                    ? ` • ${new Date(d.published_at).toLocaleDateString(
                        "id-ID",
                      )}`
                    : ""}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {supabaseUrl ? (
                    <Link
                      className="font-medium text-foreground hover:underline"
                      href={`${supabaseUrl}/storage/v1/object/public/portal-public/${encodeURI(
                        d.file_path,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Unduh dokumen
                    </Link>
                  ) : (
                    <span className="text-amber-950">
                      Supabase env belum diset.
                    </span>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Path: <span className="font-mono">{d.file_path}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState text="Belum ada dokumen publik." />
          )
        ) : (
          <ErrorState error={res.error} hint={res.hint} />
        )}
      </div>
    </main>
  );
}

