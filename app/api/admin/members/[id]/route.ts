import { NextResponse } from "next/server";
import { proxyInkaiGet, proxyInkaiJson } from "@/lib/inkai-api/proxy";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyInkaiGet(`/v1/members/${id}`);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");

  if (action === "approve" || action === "reject") {
    const { res, data } = await inkaiFetch(
      `/v1/members/${id}/registration`,
      {
        method: "PATCH",
        body: JSON.stringify({
          action,
          nia: typeof body.nia === "string" ? body.nia : undefined,
        }),
      },
      token,
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: inkaiErrorMessage(data, "Gagal memverifikasi") },
        { status: res.status },
      );
    }
    return NextResponse.json({ data: data.data ?? null, message: data.message });
  }

  if (action === "set_nia") {
    return proxyInkaiJson(`/v1/members/${id}`, {
      method: "PATCH",
      body: { nia: body.nia },
    });
  }

  if (action === "deactivate") {
    return proxyInkaiJson(`/v1/members/${id}`, {
      method: "PATCH",
      body: { status: body.statusKind === "SUSPENDED" ? "SUSPENDED" : "INACTIVE" },
    });
  }

  if (action === "activate") {
    return proxyInkaiJson(`/v1/members/${id}`, {
      method: "PATCH",
      body: { status: "Active" },
    });
  }

  // Generic patch (profile fields)
  const { action: _a, ...rest } = body;
  return proxyInkaiJson(`/v1/members/${id}`, { method: "PATCH", body: rest });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyInkaiJson(`/v1/members/${id}`, { method: "DELETE" });
}
