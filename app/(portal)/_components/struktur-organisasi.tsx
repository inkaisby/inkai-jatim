"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  Download,
  MapPin,
  Network,
  Users,
} from "lucide-react";
import {
  BIDANG,
  PELINDUNG,
  PEMBINA,
  PENASEHAT,
  PENGURUS_INTI,
  PENGURUS_SK,
  initials,
  type Officer,
  type Person,
} from "@/lib/portal/pengurus-2024-2028";

const TOC = [
  { id: "so-pelindung", label: "Pelindung" },
  { id: "so-pembina", label: "Pembina" },
  { id: "so-penasehat", label: "Penasehat" },
  { id: "so-pengurus", label: "Pengurus Inti" },
  { id: "so-bidang", label: "Bidang" },
  { id: "so-jejaring", label: "Cabang & Dojo" },
  { id: "so-kontak", label: "Sekretariat" },
  { id: "so-sk", label: "Lampiran SK" },
] as const;

function PersonList({ people }: { people: Person[] }) {
  return (
    <ol className="m-0 list-decimal space-y-1.5 pl-5 text-sm">
      {people.map((p) => (
        <li key={p.name + (p.note ?? "")}>
          {p.name}
          {p.note ? (
            <span className="text-muted-foreground"> ({p.note})</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function OfficerCard({ officer, featured }: { officer: Officer; featured?: boolean }) {
  return (
    <div
      className={[
        "flex flex-col items-center rounded-2xl border text-center transition",
        featured
          ? "border-accent/40 bg-accent/5 px-5 py-5 shadow-sm"
          : "border-border bg-card/70 px-4 py-4",
      ].join(" ")}
    >
      <div
        className={[
          "mb-3 flex items-center justify-center rounded-full font-bold tracking-wide",
          featured
            ? "h-16 w-16 bg-accent text-accent-foreground text-lg"
            : "h-12 w-12 bg-muted text-foreground text-sm",
        ].join(" ")}
        aria-hidden
      >
        {initials(officer.name)}
      </div>
      <p
        className={[
          "font-semibold leading-snug",
          featured ? "text-base" : "text-sm",
        ].join(" ")}
      >
        {officer.name}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">
        {officer.title}
      </p>
    </div>
  );
}

export function StrukturOrganisasi() {
  const [preview, setPreview] = useState<string | null>(null);
  const ketua = PENGURUS_INTI.find((o) => o.tier === "ketua")!;
  const wakil = PENGURUS_INTI.filter((o) => o.tier === "wakil");
  const sekretariat = PENGURUS_INTI.filter((o) => o.tier === "sekretariat");
  const keuangan = PENGURUS_INTI.filter((o) => o.tier === "keuangan");

  return (
    <div className="not-prose mx-auto max-w-3xl text-foreground">
      <div className="mb-6 text-right text-xs leading-snug text-muted-foreground">
        <p>Lampiran Surat Keputusan</p>
        <p>Nomor: {PENGURUS_SK.nomor}</p>
        <p>Tanggal: {PENGURUS_SK.tanggal}</p>
      </div>

      <header className="mb-8 border-b border-border pb-6 text-center">
        <h1 className="m-0 text-xl font-bold tracking-[0.08em] uppercase md:text-2xl">
          Susunan Pengurus
        </h1>
        <p className="m-0 mt-2 text-base font-semibold uppercase tracking-wide">
          Provinsi INKAI Jawa Timur
        </p>
        <p className="m-0 mt-1 text-sm font-medium tracking-wide text-muted-foreground">
          Massa Bakti {PENGURUS_SK.masaBakti}
        </p>
      </header>

      <nav
        aria-label="Daftar isi struktur organisasi"
        className="mb-10 flex flex-wrap gap-2"
      >
        {TOC.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        <section id="so-pelindung" className="scroll-mt-28">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
            I. Pelindung
          </h2>
          <PersonList people={PELINDUNG} />
        </section>

        <section id="so-pembina" className="scroll-mt-28">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
            II. Pembina
          </h2>
          <PersonList people={PEMBINA} />
        </section>

        <section id="so-penasehat" className="scroll-mt-28">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
            III. Penasehat
          </h2>
          <PersonList people={PENASEHAT} />
        </section>

        <section id="so-pengurus" className="scroll-mt-28">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">
            IV. Pengurus
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Struktur inti masa bakti {PENGURUS_SK.masaBakti}. Inisial dipakai
            sebagai identitas visual hingga foto resmi tersedia.
          </p>

          <div className="space-y-4">
            <div className="mx-auto max-w-sm">
              <OfficerCard officer={ketua} featured />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {wakil.map((o) => (
                <OfficerCard key={o.title} officer={o} />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[...sekretariat, ...keuangan].map((o) => (
                <OfficerCard key={o.title} officer={o} />
              ))}
            </div>
          </div>
        </section>

        <section id="so-bidang" className="scroll-mt-28">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
            Bidang-Bidang
          </h2>
          <div className="space-y-3">
            {BIDANG.map((bidang) => (
              <details
                key={bidang.id}
                id={bidang.id}
                className="group rounded-2xl border border-border bg-card/50 open:bg-card/80"
                open={bidang.id === "bidang-organisasi"}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold marker:content-none">
                  <span>{bidang.title}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
                </summary>
                <div className="space-y-4 border-t border-border px-4 py-4">
                  {bidang.subsections.map((sub) => (
                    <div key={sub.title}>
                      <p className="mb-2 text-sm font-semibold">{sub.title}</p>
                      {sub.groups ? (
                        <div className="space-y-3 pl-3">
                          {sub.groups.map((g) => (
                            <div key={g.title}>
                              <p className="mb-1 text-sm font-medium text-muted-foreground">
                                {g.title}
                              </p>
                              <PersonList people={g.members} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <PersonList people={sub.members ?? []} />
                      )}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section
          id="so-jejaring"
          className="scroll-mt-28 rounded-2xl border border-border bg-muted/40 p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Network className="h-5 w-5 text-accent" />
            <h2 className="m-0 text-sm font-bold uppercase tracking-wide">
              Jejaring di Bawah Provinsi
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Pengurus Provinsi membina pengurus cabang/kabupaten-kota, yang
            selanjutnya mengoordinasikan dojo di wilayah masing-masing. Direktori
            dojo publik tersedia di portal.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-primary" href="/dojo">
              <Users className="h-4 w-4" />
              <span>Direktori Dojo</span>
            </Link>
            <a className="btn-outline" href="#so-bidang">
              <span>Lihat Bidang Provinsi</span>
            </a>
          </div>
        </section>

        <section
          id="so-kontak"
          className="scroll-mt-28 rounded-2xl border border-border bg-card/70 p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <h2 className="m-0 text-sm font-bold uppercase tracking-wide">
              Sekretariat Provinsi
            </h2>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {PENGURUS_SK.sekretariat.alamat}
          </p>
          <a
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold shadow-sm transition hover:border-accent/40 hover:text-accent"
            href={PENGURUS_SK.sekretariat.mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span>Petunjuk Arah Google Maps</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            Email dan nomor telepon resmi belum dipublikasikan di portal.
          </p>
        </section>

        <section id="so-sk" className="scroll-mt-28">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">
            Lampiran SK
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Dokumen resmi berdasarkan SK Nomor {PENGURUS_SK.nomor} tanggal{" "}
            {PENGURUS_SK.tanggal}. Klik gambar untuk memperbesar, atau unduh
            masing-masing halaman.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {PENGURUS_SK.lampiranImages.map((img, idx) => (
              <figure key={img.src} className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPreview(img.src)}
                  className="block w-full overflow-hidden rounded-xl border border-border bg-muted text-left transition hover:border-accent/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={`Lampiran SK halaman ${idx + 1}`}
                    className="h-40 w-full object-cover object-top"
                  />
                </button>
                <figcaption className="text-xs text-muted-foreground">
                  {img.label}
                </figcaption>
                <a
                  href={img.download}
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh halaman {idx + 1}
                </a>
              </figure>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground">
        Berdasarkan Lampiran SK Nomor {PENGURUS_SK.nomor} tanggal{" "}
        {PENGURUS_SK.tanggal}.
      </footer>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau lampiran SK"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-background p-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 z-10 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
            >
              Tutup
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Pratinjau lampiran SK"
              className="h-auto w-full rounded-xl"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
