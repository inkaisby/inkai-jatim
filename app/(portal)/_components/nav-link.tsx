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
        "rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 relative",
        active
          ? "bg-accent/10 text-accent dark:bg-accent/20"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      ].join(" ")}
    >
      {children}
      {active && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-accent" />
      )}
    </Link>
  );
}


