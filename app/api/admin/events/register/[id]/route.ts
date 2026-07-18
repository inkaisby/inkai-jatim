import { proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  return proxyInkaiJson(`/v1/events/register/${id}`, { method: "PUT", body });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return proxyInkaiJson(`/v1/events/register/${id}`, { method: "DELETE" });
}
