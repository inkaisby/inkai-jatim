import { proxyInkaiGet, proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function GET() {
  return proxyInkaiGet("/v1/chat/conversations");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return proxyInkaiJson("/v1/chat/conversations", { method: "POST", body });
}
