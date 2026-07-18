"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Search,
  UserPlus,
} from "lucide-react";
import type { MemberListItem } from "@/lib/members/queries";
import { useDashboardData } from "./dashboard-data-context";
import { ExportCsvButton } from "./export-csv-button";
import { memberStatusLabel } from "@/lib/admin-labels";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [niaDraft, setNiaDraft] = useState<Record<string, string>>({});

  // Add form
  const [fullName, setFullName] = useState("");
  const [dojoId, setDojoId] = useState("");
  const [email, setEmail] = useState("");
  const [nia, setNia] = useState("");
  const [currentRank, setCurrentRank] = useState("Putih");

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
        setSelected(new Set());
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

  async function patchMember(id: string, body: Record<string, unknown>) {
    setActingId(id);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setMessage(json.error ?? "Aksi gagal.");
        return;
      }
      setMessage(json.message ?? "Berhasil.");
      await loadMembers();
      router.refresh();
    } catch {
      setMessage("Aksi gagal.");
    } finally {
      setActingId(null);
    }
  }

  async function bulkAction(action: "approve" | "deactivate") {
    const memberIds = [...selected];
    if (memberIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, memberIds }),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      setMessage(json.message ?? json.error ?? "Selesai.");
      await loadMembers();
      router.refresh();
    } catch {
      setMessage("Bulk gagal.");
    } finally {
      setLoading(false);
    }
  }

  async function createMember(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !dojoId) {
      setMessage("Nama dan dojo wajib.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dojoId,
          email: email.trim() || undefined,
          nia: nia.trim() || undefined,
          currentRank,
          status: "Active",
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Gagal menambah anggota.");
        return;
      }
      setShowAdd(false);
      setFullName("");
      setEmail("");
      setNia("");
      setDojoId("");
      setMessage("Anggota ditambahkan.");
      await loadMembers();
    } catch {
      setMessage("Gagal menambah anggota.");
    } finally {
      setLoading(false);
    }
  }

  const statusFilters = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "PENDING", label: "Pending" },
      { id: "Active", label: "Aktif" },
      { id: "INACTIVE", label: "Nonaktif" },
      { id: "REJECTED", label: "Ditolak" },
    ],
    [],
  );

  const csvRows = members.map((m) => [
    m.fullName,
    m.nia ?? "",
    m.email ?? "",
    m.status,
    m.currentRank ?? "",
    m.dojoName ?? "",
    m.branchName ?? "",
  ]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === members.length) setSelected(new Set());
    else setSelected(new Set(members.map((m) => m.id)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold">Database Anggota Provinsi</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsvButton
            filename={`anggota-jatim-${new Date().toISOString().slice(0, 10)}.csv`}
            headers={["Nama", "NIA", "Email", "Status", "Sabuk", "Dojo", "Cabang"]}
            rows={csvRows}
          />
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Tambah
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

      {showAdd && (
        <form onSubmit={createMember} className="glass-card grid gap-3 p-4 md:grid-cols-2">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama lengkap"
            className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
          <select
            required
            value={dojoId}
            onChange={(e) => setDojoId(e.target.value)}
            className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          >
            <option value="">Pilih dojo</option>
            {context.allDojos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.branchName ? `(${d.branchName})` : ""}
              </option>
            ))}
          </select>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (opsional)"
            type="email"
            className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
          <input
            value={nia}
            onChange={(e) => setNia(e.target.value)}
            placeholder="NIA (opsional)"
            className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
          <input
            value={currentRank}
            onChange={(e) => setCurrentRank(e.target.value)}
            placeholder="Sabuk"
            className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm"
          />
          <button type="submit" className="btn-outline text-xs">
            Simpan anggota
          </button>
        </form>
      )}

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
          className="rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm"
        >
          <option value="all">Semua Cabang</option>
          {context.branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => void loadMembers({ search })} className="btn-outline text-xs">
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

      {selected.size > 0 && canVerify && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs">
          <span className="font-semibold">{selected.size} dipilih</span>
          <button type="button" onClick={() => void bulkAction("approve")} className="btn-outline text-[11px]">
            Bulk approve pending
          </button>
          <button type="button" onClick={() => void bulkAction("deactivate")} className="btn-ghost text-[11px]">
            Bulk nonaktifkan
          </button>
        </div>
      )}

      {message && (
        <p className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">{message}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" checked={members.length > 0 && selected.size === members.length} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">NIA</th>
              <th className="px-4 py-3 font-semibold">Sabuk</th>
              <th className="px-4 py-3 font-semibold">Dojo / Cabang</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Memuat data...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada anggota pada filter ini.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t border-border/60 align-top">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggleSelect(member.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span>{member.nia || "—"}</span>
                      {canVerify && (
                        <div className="flex gap-1">
                          <input
                            value={niaDraft[member.id] ?? ""}
                            onChange={(e) =>
                              setNiaDraft((prev) => ({ ...prev, [member.id]: e.target.value }))
                            }
                            placeholder="Set NIA"
                            className="w-24 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px]"
                          />
                          <button
                            type="button"
                            disabled={actingId === member.id || !(niaDraft[member.id] ?? "").trim()}
                            onClick={() =>
                              void patchMember(member.id, {
                                action: "set_nia",
                                nia: (niaDraft[member.id] ?? "").trim(),
                              })
                            }
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold disabled:opacity-50"
                          >
                            Simpan
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{member.currentRank || "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    <p>{member.dojoName || "—"}</p>
                    <p className="text-muted-foreground">{member.branchName || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
                      {memberStatusLabel(member.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {canVerify && member.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            disabled={actingId === member.id}
                            onClick={() =>
                              void patchMember(member.id, {
                                action: "approve",
                                nia: (niaDraft[member.id] ?? "").trim() || undefined,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Setuju
                          </button>
                          <button
                            type="button"
                            disabled={actingId === member.id}
                            onClick={() => void patchMember(member.id, { action: "reject" })}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600/90 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Tolak
                          </button>
                        </>
                      )}
                      {canVerify && (member.status === "Active" || member.status === "ACTIVE") && (
                        <button
                          type="button"
                          disabled={actingId === member.id}
                          onClick={() => void patchMember(member.id, { action: "deactivate" })}
                          className="rounded-lg border border-border/70 px-2 py-1 text-[11px] font-semibold disabled:opacity-50"
                        >
                          Nonaktif
                        </button>
                      )}
                      {canVerify &&
                        (member.status === "INACTIVE" || member.status === "SUSPENDED") && (
                          <button
                            type="button"
                            disabled={actingId === member.id}
                            onClick={() => void patchMember(member.id, { action: "activate" })}
                            className="rounded-lg border border-border/70 px-2 py-1 text-[11px] font-semibold disabled:opacity-50"
                          >
                            Aktifkan
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
