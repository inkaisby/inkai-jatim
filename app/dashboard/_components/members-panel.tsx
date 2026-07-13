"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RefreshCw, Users } from "lucide-react";
import type { MemberListItem } from "@/lib/members/queries";

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
  const [members, setMembers] = useState<MemberListItem[]>(initialMembers);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(initialError);
  const [actingId, setActingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const query = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const response = await fetch(`/api/members${query}`);
      const json = (await response.json()) as { data?: MemberListItem[]; error?: string };
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
  }, [filter]);

  async function handleFilterChange(nextFilter: string) {
    if (nextFilter === filter) return;
    setFilter(nextFilter);
    setLoading(true);
    setMessage(null);
    try {
      const query = nextFilter === "all" ? "" : `?status=${encodeURIComponent(nextFilter)}`;
      const response = await fetch(`/api/members${query}`);
      const json = (await response.json()) as { data?: MemberListItem[]; error?: string };
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
  }

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold">Daftar Anggota (Cakupan Anda)</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Semua" },
            { id: "Pending", label: "Pending" },
            { id: "Active", label: "Aktif" },
            { id: "Rejected", label: "Ditolak" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void handleFilterChange(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === item.id
                  ? "bg-accent text-accent-foreground"
                  : "border border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadMembers()}
            className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="glass-card overflow-hidden p-0">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Tidak ada anggota pada filter ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Dojo</th>
                  <th className="px-4 py-3">Status</th>
                  {canVerify && <th className="px-4 py-3">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border/40">
                    <td className="px-4 py-3 font-medium">{member.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p>{member.dojoName ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{member.branchName ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                        {member.profileStatus ?? member.status}
                      </span>
                    </td>
                    {canVerify && (
                      <td className="px-4 py-3">
                        {(member.profileStatus === "pending" || member.status === "Pending") && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={actingId === member.id}
                              onClick={() => void handleVerify(member.id, "approve")}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/25 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Setujui
                            </button>
                            <button
                              type="button"
                              disabled={actingId === member.id}
                              onClick={() => void handleVerify(member.id, "reject")}
                              className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
