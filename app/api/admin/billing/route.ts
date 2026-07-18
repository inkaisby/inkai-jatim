import { proxyInkaiGet, proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function GET(request: Request) {
  return proxyInkaiGet("/v1/billing", request);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyInkaiJson("/v1/billing", { method: "POST", body });
}
