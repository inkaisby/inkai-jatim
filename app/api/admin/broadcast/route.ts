import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function POST(request: Request) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    content?: string;
    type?: string;
    targetRole?: string;
  };

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "Judul dan isi wajib diisi" }, { status: 400 });
  }

  const { res, data } = await inkaiFetch(
    "/v1/notifications/broadcast",
    {
      method: "POST",
      body: JSON.stringify({
        title: body.title.trim(),
        content: body.content.trim(),
        type: body.type || "INFO",
        targetRole: body.targetRole || undefined,
      }),
    },
    token,
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal mengirim broadcast") },
      { status: res.status },
    );
  }

  const payload = data.data as { count?: number } | undefined;
  return NextResponse.json({
    message:
      typeof data.message === "string"
        ? data.message
        : "Broadcast berhasil dikirim.",
    count: payload?.count ?? (Array.isArray(data.data) ? data.data.length : undefined),
    data: data.data ?? null,
  });
}
