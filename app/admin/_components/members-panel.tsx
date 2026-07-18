"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Download,
  Search,
} from "lucide-react";
import type { MemberListItem } from "@/lib/members/queries";
import { useDashboardData } from "./dashboard-data-context";

export function MembersPanel({
  canVerify,
  initialMembers,
  initialError = null,
}: {
  canVerify: boolean;
  initialMembers: MemberListItem[];
  initialError?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useDashboardData();
  const [members, setMembers] = useState<MemberListItem[]>(initialMembers);
  const [filter, setFilter] = useState<string>("all");
  const [branchId, setBranchId] = useState(searchParams.get("cabang") ?? "all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(initialError);
  const [actingId, setActingId] = useState<string | null>(null);

  const buildQuery = useCallback(
    (next?: { status?: string; branchId?: string; search?: string }) => {
      const qs = new URLSearchParams();
      const status = next?.status ?? filter;
      const branch = next?.branchId ?? branchId;
      const q = next?.search ?? search;
      if (status !== "all") qs.set("status", status);
      if (branch !== "all") qs.set("branchId", branch);
      if (q.trim()) qs.set("search", q.trim());
      qs.set("limit", "200");
      return qs.toString();
    },
    [filter, branchId, search],
  );

  const loadMembers = useCallback(
    async (next?: { status?: string; branchId?: string; search?: string }) => {
      setLoading(true);
      setMessage(null);
      try {
        const response = await fetch(`/api/members?${buildQuery(next)}`);
        const json = (await response.json()) as {
          data?: MemberListItem[];
          error?: string;
        };
        if (!response.ok) {
          setMessage(json.error ?? "Gagal memuat anggota.");
          setMembers([]);
          return;
        }
        setMembers(json.data ?? []);
      } catch {
        setMessage("Gagal memuat anggota.");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    },
    [buildQuery],
  );

  useEffect(() => {
    const cabang = searchParams.get("cabang");
    if (cabang && cabang !== branchId) {
      setBranchId(cabang);
      void loadMembers({ branchId: cabang });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleVerify(memberId: string, action: "approve" | "reject") {
    setActingId(memberId);
    setMessage(null);
    try {
      const response = await fetch(`/api/members/${memberId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(json.error ?? "Verifikasi gagal.");
        return;
      }
      setMessage(action === "approve" ? "Anggota disetujui." : "Anggota ditolak.");
      await loadMembers();
      router.refresh();
    } catch {
      setMessage("Verifikasi gagal.");
    } finally {
      setActingId(null);
    }
  }

  function exportCsv() {
    const header = ["Nama", "NIA", "Email", "Status", "Sabuk", "Dojo", "Cabang"];
    const rows = members.map((m) => [
      m.fullName,
      m.nia ?? "",
      m.email ?? "",
      m.status,
      m.currentRank ?? "",
      m.dojoName ?? "",
      m.branchName ?? "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anggota-jatim-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statusFilters = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "PENDING", label: "Pending" },
      { id: "Active", label: "Aktif" },
      { id: "REJECTED", label: "Ditolak" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold">Database Anggota Provinsi</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => void loadMembers()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Muat ulang
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void loadMembers({ search });
            }}
            placeholder="Cari nama / NIA / email..."
            className="w-full rounded-xl border border-border/70 bg-background/70 py-2.5 pl-10 pr-3 text-sm outline-none ring-accent/30 focus:ring-2"
          />
        </div>
        <select
          value={branchId}
          onChange={(e) => {
            const next = e.target.value;
            setBranchId(next);
            void loadMembers({ branchId: next });
          }}
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm outline-none ring-accent/30 focus:ring-2"
        >
          <option value="all">Semua Cabang</option>
          {context.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void loadMembers({ search })}
          className="btn-outline text-xs"
        >
          Cari
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              void loadMembers({ status: item.id });
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === item.id
                ? "bg-accent text-accent-foreground"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">{message}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">NIA</th>
              <th className="px-4 py-3 font-semibold">Sabuk</th>
              <th className="px-4 py-3 font-semibold">Dojo</th>
              <th className="px-4 py-3 font-semibold">Cabang</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {canVerify && <th className="px-4 py-3 font-semibold">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={canVerify ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat data...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={canVerify ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada anggota pada filter ini.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{member.nia || "—"}</td>
                  <td className="px-4 py-3 text-xs">{member.currentRank || "—"}</td>
                  <td className="px-4 py-3 text-xs">{member.dojoName || "—"}</td>
                  <td className="px-4 py-3 text-xs">{member.branchName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                      {member.status}
                    </span>
                  </td>
                  {canVerify && (
                    <td className="px-4 py-3">
                      {member.status === "PENDING" ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            disabled={actingId === member.id}
                            onClick={() => void handleVerify(member.id, "approve")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Setuju
                          </button>
                          <button
                            type="button"
                            disabled={actingId === member.id}
                            onClick={() => void handleVerify(member.id, "reject")}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
