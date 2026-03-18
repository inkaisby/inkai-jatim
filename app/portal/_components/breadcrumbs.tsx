import Link from "next/link";

export type BreadcrumbItem = { href: string; label: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {items.map((item, idx) => (
          <li key={item.href} className="flex items-center gap-x-2">
            <Link
              href={item.href}
              className="rounded-md px-1.5 py-0.5 hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
            {idx < items.length - 1 ? (
              <span className="select-none text-muted-foreground/70">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

