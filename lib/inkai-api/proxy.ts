import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch, inkaiErrorMessage } from "@/lib/inkai-api/server";

export async function proxyInkaiGet(path: string, request?: Request) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let target = path;
  if (request) {
    const incoming = new URL(request.url).searchParams.toString();
    if (incoming) {
      target += (path.includes("?") ? "&" : "?") + incoming;
    }
  }

  const { res, data } = await inkaiFetch(target, {}, token);
  if (!res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal memuat data") },
      { status: res.status },
    );
  }
  return NextResponse.json({ data: data.data ?? data, meta: data.meta ?? null, message: data.message });
}

export async function proxyInkaiJson(
  path: string,
  init: { method: string; body?: unknown },
) {
  const token = await getInkaiTokenFromCookies();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { res, data } = await inkaiFetch(
    path,
    {
      method: init.method,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    },
    token,
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: inkaiErrorMessage(data, "Gagal memproses permintaan") },
      { status: res.status },
    );
  }

  return NextResponse.json({
    data: data.data ?? data,
    message: typeof data.message === "string" ? data.message : "Berhasil",
  });
}
