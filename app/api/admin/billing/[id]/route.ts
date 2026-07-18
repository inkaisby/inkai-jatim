import { proxyInkaiJson } from "@/lib/inkai-api/proxy";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    amount?: number;
    adminNotes?: string;
    status?: string;
  };

  if (body.action === "update" || body.amount !== undefined) {
    return proxyInkaiJson(`/v1/billing/${id}`, {
      method: "PATCH",
      body: { amount: body.amount },
    });
  }

  // approve / reject / mark_paid → verify endpoint
  const status =
    body.action === "reject"
      ? "REJECTED"
      : body.action === "mark_paid" || body.action === "approve"
        ? "APPROVED"
        : body.status || "APPROVED";

  return proxyInkaiJson("/v1/billing/verify", {
    method: "POST",
    body: { billingId: id, status, adminNotes: body.adminNotes },
  });
}
