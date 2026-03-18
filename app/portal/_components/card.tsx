import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5">{children}</div>;
}

export function CardLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
    >
      {children}
    </Link>
  );
}

