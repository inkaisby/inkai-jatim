"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PortalSessionUser } from "@/lib/auth/types";

export function AuthHeaderActions({
  onLoginClick,
}: {
  onLoginClick: () => void;
}) {
  const [user, setUser] = useState<PortalSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me");
        const json = (await response.json()) as { user?: PortalSessionUser | null };
        setUser(json.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void loadSession();
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-muted/60" aria-hidden />
    );
  }

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="relative inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-xs font-semibold tracking-wide text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 active:scale-95"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <button
      onClick={onLoginClick}
      className="relative inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold tracking-wide text-background transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:shadow-accent/20 active:scale-95 cursor-pointer"
    >
      Login Member
    </button>
  );
}
