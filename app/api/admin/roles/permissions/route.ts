import { proxyInkaiGet } from "@/lib/inkai-api/proxy";

export async function GET() {
  return proxyInkaiGet("/v1/roles/permissions");
}
