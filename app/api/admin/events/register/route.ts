import { proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyInkaiJson("/v1/events/register", { method: "POST", body });
}
