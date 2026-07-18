import { proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  return proxyInkaiJson(`/v1/org/branches/${id}`, { method: "PATCH", body });
}
