"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, ShieldCheck } from "lucide-react";

type VerificationClaim = {
  id: string;
  type: string;
  data: string | null;
  proofUrl: string | null;
  status: string;
  createdAt: string;
  member?: {
    fullName?: string;
    nia?: string | null;
    currentRank?: string | null;
    dojo?: {
      name?: string;
      branch?: { name?: string; province?: { name?: string } };
    };
  };
};

export function VerifikasiView() {
  const [claims, setClaims] = useState<VerificationClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/verifications");
      const json = (await res.json()) as { data?: VerificationClaim[]; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memuat antrian verifikasi.");
        setClaims([]);
        return;
      }
      setClaims(json.data ?? []);
    } catch {
      setMessage("Gagal memuat antrian verifikasi.");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function processClaim(id: string, status: "APPROVED" | "REJECTED") {
    setActingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal memproses klaim.");
        return;
      }
      setMessage(status === "APPROVED" ? "Klaim disetujui." : "Klaim ditolak.");
      await load();
    } catch {
      setMessage("Gagal memproses klaim.");
    } finally {
      setActingId(null);
    }
  }

  const filtered =
    typeFilter === "all" ? claims : claims.filter((c) => c.type === typeFilter);

  const types = Array.from(new Set(claims.map((c) => c.type)));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Persetujuan Provinsi
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Verifikasi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Antrian klaim mutasi, prestasi, dan kenaikan sabuk dari anggota se-Jawa Timur
          (Inkai API `/v1/verifications`).
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            typeFilter === "all"
              ? "bg-accent text-accent-foreground"
              : "border border-border/70 text-muted-foreground"
          }`}
        >
          Semua ({claims.length})
        </button>
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              typeFilter === type
                ? "bg-accent text-accent-foreground"
                : "border border-border/70 text-muted-foreground"
            }`}
          >
            {type}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void load()}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Muat ulang
        </button>
      </div>

      {message && (
        <p className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">{message}</p>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat antrian...</p>
        ) : filtered.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-3 px-4 py-12 text-center">
            <ShieldCheck className="h-8 w-8 text-accent/70" />
            <p className="text-sm text-muted-foreground">Tidak ada klaim pending.</p>
          </div>
        ) : (
          filtered.map((claim) => (
            <article key={claim.id} className="glass-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                    {claim.type}
                  </p>
                  <h2 className="text-base font-semibold">
                    {claim.member?.fullName ?? "Anggota"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    NIA: {claim.member?.nia || "—"} · Sabuk: {claim.member?.currentRank || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[claim.member?.dojo?.name, claim.member?.dojo?.branch?.name]
                      .filter(Boolean)
                      .join(" · ") || "Wilayah tidak diketahui"}
                  </p>
                  {claim.data && (
                    <p className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-xs">{claim.data}</p>
                  )}
                  {claim.proofUrl && (
                    <a
                      href={claim.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-semibold text-accent hover:underline"
                    >
                      Lihat bukti
                    </a>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Diajukan: {new Date(claim.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={actingId === claim.id}
                    onClick={() => void processClaim(claim.id, "APPROVED")}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600/90 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Setuju
                  </button>
                  <button
                    type="button"
                    disabled={actingId === claim.id}
                    onClick={() => void processClaim(claim.id, "REJECTED")}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-600/90 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Tolak
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
