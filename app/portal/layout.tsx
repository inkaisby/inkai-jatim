import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { NavLink } from "./_components/nav-link";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/portal"
            className="flex items-center gap-2 font-semibold tracking-tight"
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
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/portal/profil">Profil</NavLink>
            <NavLink href="/portal/berita">Berita</NavLink>
            <NavLink href="/portal/agenda">Agenda</NavLink>
            <NavLink href="/portal/dojo">Dojo</NavLink>
            <NavLink href="/portal/dokumen">Dokumen</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-outline px-4 py-1.5"
            >
              Login
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <div className="flex flex-wrap gap-2">
            <NavLink href="/portal/profil">Profil</NavLink>
            <NavLink href="/portal/berita">Berita</NavLink>
            <NavLink href="/portal/agenda">Agenda</NavLink>
            <NavLink href="/portal/dojo">Dojo</NavLink>
            <NavLink href="/portal/dokumen">Dokumen</NavLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>

      <footer className="border-t border-border bg-background/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="font-semibold">INKAI Jawa Timur</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Portal publik: berita, agenda, direktori dojo, dan dokumen.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Menu</div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/portal/profil">
                  Profil
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/portal/berita">
                  Berita
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/portal/agenda">
                  Agenda
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/portal/dojo">
                  Dojo
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/portal/dokumen">
                  Dokumen
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Kontak</div>
            <p className="mt-2 text-muted-foreground">
              Kontak resmi & halaman login dibahas pada tahap berikutnya.
            </p>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} INKAI Jatim
        </div>
      </footer>
    </div>
  );
}

