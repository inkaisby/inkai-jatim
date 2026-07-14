import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch } from "@/lib/inkai-api/server";
import type { PortalSessionUser } from "@/lib/auth/types";

export type MemberListItem = {
  id: string;
  userId: string;
  fullName: string;
  email: string | null;
  status: string;
  profileStatus: string | null;
  dojoId: string;
  dojoName: string | null;
  branchName: string | null;
  createdAt: string;
};

function mapMemberRow(row: Record<string, unknown>): MemberListItem {
  const status = String(row.status ?? "");
  return {
    id: String(row.id),
    userId: String(row.userId ?? ""),
    fullName: String(row.fullName ?? ""),
    email: (row.user as { email?: string } | undefined)?.email ?? null,
    status,
    profileStatus:
      status === "PENDING" ? "pending" : status === "REJECTED" ? "rejected" : "approved",
    dojoId: String(row.dojoId ?? ""),
    dojoName: (row.dojo as { name?: string } | undefined)?.name ?? null,
    branchName: (row.dojo as { branch?: { name?: string } } | undefined)?.branch?.name ?? null,
    createdAt: String(row.createdAt ?? ""),
  };
}

export async function listMembersInScope(
  _user: PortalSessionUser,
  options: { status?: string; limit?: number } = {},
) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return { ok: false as const, error: "Belum login." };

  const qs = new URLSearchParams();
  if (options.status) qs.set("status", options.status);
  qs.set("limit", String(options.limit ?? 100));

  const { res, data } = await inkaiFetch(`/v1/members?${qs}`, {}, token);
  if (!res.ok) {
    return { ok: false as const, error: "Gagal memuat anggota dari API." };
  }

  const rows = (data.data as Array<Record<string, unknown>>) ?? [];
  return { ok: true as const, data: rows.map(mapMemberRow) };
}

export async function verifyMemberInScope(
  _user: PortalSessionUser,
  memberId: string,
  action: "approve" | "reject",
) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return { ok: false as const, error: "Belum login." };

  const { res, data } = await inkaiFetch(
    `/v1/members/${memberId}/registration`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
    token,
  );

  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : "Gagal memverifikasi anggota.";
    return { ok: false as const, error: message };
  }

  const profileStatus = action === "approve" ? "approved" : "rejected";
  return { ok: true as const, status: profileStatus };
}
