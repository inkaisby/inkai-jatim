import { proxyInkaiGet, proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function GET() {
  return proxyInkaiGet("/v1/roles");
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    roleId?: string;
    permissionIds?: string[];
  };
  if (!body.roleId) {
    return Response.json({ error: "roleId wajib" }, { status: 400 });
  }
  return proxyInkaiJson(`/v1/roles/${body.roleId}/permissions`, {
    method: "PUT",
    body: { permissionIds: body.permissionIds ?? [] },
  });
}
