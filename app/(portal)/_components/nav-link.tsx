"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "rounded-full px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

