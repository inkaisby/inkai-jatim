import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="btn-outline px-4 py-1.5">
      ← {label}
    </Link>
  );
}

