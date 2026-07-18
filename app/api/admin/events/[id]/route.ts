import { proxyInkaiJson, proxyInkaiGet } from "@/lib/inkai-api/proxy";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyInkaiGet(`/v1/events/${id}`);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  return proxyInkaiJson(`/v1/events/${id}`, { method: "PATCH", body });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyInkaiJson(`/v1/events/${id}`, { method: "DELETE" });
}
