import { proxyInkaiGet } from "@/lib/inkai-api/proxy";

export async function GET(request: Request) {
  return proxyInkaiGet("/v1/audit-logs", request);
}
