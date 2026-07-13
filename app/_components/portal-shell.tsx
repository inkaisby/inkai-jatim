import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { ComponentType } from "react";

type NavItem = { href: string; label: string };

export function PortalShell({
  homeHref,
  navItems,
  NavLinkComponent,
  children,
}: {
  homeHref: string;
  navItems: NavItem[];
  NavLinkComponent: ComponentType<{ href: string; children: ReactNode }>;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href={homeHref}
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            <Image
              src="/logo-inkai.png"
              alt="Logo INKAI"
              width={32}
              height={32}
              className="rounded-full bg-card p-0.5 ring-1 ring-border shadow-sm"
              priority
            />
            <span>
              <span className="text-accent">INKAI</span> Jatim
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-4">
            <nav className="hidden flex-1 items-center justify-end gap-1 md:flex">
              {navItems.map((item) => (
                <NavLinkComponent key={item.href} href={item.href}>
                  {item.label}
                </NavLinkComponent>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button type="button" className="btn-outline px-4 py-1.5">
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Removed mobile navigation subheader as requested */}
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>

      <footer className="border-t border-border bg-background/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo-inkai.png"
                alt="Logo INKAI"
                width={40}
                height={40}
                className="rounded-full bg-card p-0.5 ring-1 ring-border shadow-sm"
              />
            </div>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">
                Pengurus INKAI Jawa Timur
              </div>
              <p>
                <span className="text-foreground/80">Sekretariat :</span> Jl.
                Penjaringan Asri IX.29, PS I i No.27, Penjaringan Sari, Kec.
                Rungkut, Surabaya, Jawa Timur 60297
              </p>
              <a
                className="hover:text-foreground underline underline-offset-4"
                href="https://share.google/CLHoV0eeRrkoGfCxy"
                target="_blank"
                rel="noreferrer"
              >
                https://share.google/CLHoV0eeRrkoGfCxy
              </a>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Menu</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link className="hover:text-foreground" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} INKAI Jatim
        </div>
      </footer>
    </div>
  );
}

