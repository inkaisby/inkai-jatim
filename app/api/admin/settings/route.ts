import { proxyInkaiGet, proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function GET(request: Request) {
  return proxyInkaiGet("/v1/settings", request);
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { key?: string; value?: unknown };
  if (!body.key) {
    return Response.json({ error: "key wajib" }, { status: 400 });
  }
  return proxyInkaiJson(`/v1/settings/${encodeURIComponent(body.key)}`, {
    method: "PUT",
    body: { value: body.value },
  });
}
