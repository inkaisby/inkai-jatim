import { proxyInkaiGet, proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function GET() {
  return proxyInkaiGet("/v1/notifications/my");
}

export async function PATCH() {
  return proxyInkaiJson("/v1/notifications/read-all", { method: "PATCH" });
}
