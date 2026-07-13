export type BranchOption = {
  id: string;
  name: string;
  city: string | null;
};

export type DojoOption = {
  id: string;
  name: string;
  address: string | null;
  branchId: string;
};

export async function fetchJatimBranches(): Promise<{
  ok: true;
  data: BranchOption[];
} | {
  ok: false;
  error: string;
}> {
  try {
    const response = await fetch("/api/org/branches");
    const json = (await response.json()) as { data?: BranchOption[]; error?: string };

    if (!response.ok) {
      return { ok: false, error: json.error ?? "Gagal memuat cabang." };
    }

    return { ok: true, data: json.data ?? [] };
  } catch {
    return { ok: false, error: "Gagal memuat cabang." };
  }
}

export async function fetchDojosByBranch(branchId: string): Promise<{
  ok: true;
  data: DojoOption[];
} | {
  ok: false;
  error: string;
}> {
  try {
    const response = await fetch(`/api/org/dojos?branchId=${encodeURIComponent(branchId)}`);
    const json = (await response.json()) as { data?: DojoOption[]; error?: string };

    if (!response.ok) {
      return { ok: false, error: json.error ?? "Gagal memuat dojo." };
    }

    return { ok: true, data: json.data ?? [] };
  } catch {
    return { ok: false, error: "Gagal memuat dojo." };
  }
}
