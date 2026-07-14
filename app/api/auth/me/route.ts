import { NextResponse } from "next/server";
import { getInkaiTokenFromCookies } from "@/lib/inkai-api/cookies";
import { inkaiFetch } from "@/lib/inkai-api/server";

export async function GET() {
  const token = await getInkaiTokenFromCookies();
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const { res, data } = await inkaiFetch("/v1/auth/me", {}, token);
  if (!res.ok) {
    return NextResponse.json({ user: null });
  }

  const user = (data.data as Record<string, unknown>) ?? null;
  const memberStatus = (user?.status as string | undefined) ?? "Active";

  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles ?? [],
          profileStatus:
            memberStatus === "PENDING"
              ? "pending"
              : memberStatus === "REJECTED"
                ? "rejected"
                : "approved",
        }
      : null,
  });
}
