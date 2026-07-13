"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { ComponentType } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Award, Shield, MapPin, Globe, Compass, ArrowUpRight, X } from "lucide-react";

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
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen text-foreground flex flex-col justify-between">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href={homeHref}
            className="flex shrink-0 items-center gap-3 font-semibold tracking-tight transition hover:opacity-90 group"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-accent/20 opacity-0 blur transition group-hover:opacity-100" />
              <Image
                src="/logo-inkai.png"
                alt="Logo INKAI"
                width={38}
                height={38}
                className="relative rounded-full bg-card p-0.5 ring-1 ring-border shadow-md"
                priority
              />
            </div>
            <span className="text-lg font-bold">
              <span className="text-accent">INKAI</span>{" "}
              <span className="text-foreground/90 font-medium">Jatim</span>
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-6">
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <NavLinkComponent key={item.href} href={item.href}>
                  {item.label}
                </NavLinkComponent>
              ))}
            </nav>

            <div className="h-6 w-[1px] bg-border hidden md:block" />

             <div className="flex items-center gap-3">
              <ThemeToggle />
              <a 
                href="https://inkai-mobile-web.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="relative inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2 text-xs font-semibold tracking-wide text-background transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:shadow-accent/20 active:scale-95 cursor-pointer"
              >
                Login Member
              </a>
            </div>
          </div>
        </div>

        {/* Mobile quick-nav overlay panel */}
        <div className="mx-auto max-w-6xl px-6 pb-4 md:hidden border-t border-border/40 pt-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLinkComponent key={item.href} href={item.href}>
                {item.label}
              </NavLinkComponent>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 flex-1">{children}</div>

      <footer className="border-t border-border bg-muted/30 backdrop-blur-sm mt-auto">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-inkai.png"
                alt="Logo INKAI"
                width={48}
                height={48}
                className="rounded-full bg-card p-0.5 ring-1 ring-border shadow-md"
              />
              <div>
                <h3 className="font-bold text-lg leading-tight">Pengurus Provinsi INKAI</h3>
                <p className="text-xs text-accent font-semibold tracking-wider">JAWA TIMUR</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground max-w-xl">
              <p className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                <span>
                  <strong className="text-foreground">Sekretariat:</strong> Jl. Penjaringan Asri IX.29, PS I i No.27, Penjaringan Sari, Kec. Rungkut, Surabaya, Jawa Timur 60297
                </span>
              </p>
              <div className="pt-2">
                <a
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-transparent transition-all duration-300"
                  href="https://share.google/CLHoV0eeRrkoGfCxy"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Petunjuk Arah Google Maps</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider uppercase text-foreground/80">Navigasi Portal</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    className="text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors duration-200" 
                    href={item.href}
                  >
                    <span>•</span> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-border/60 flex items-center gap-3 text-muted-foreground">
              <a href="#" className="hover:text-accent transition"><Shield className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition"><Award className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition"><Globe className="h-5 w-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>© {new Date().getFullYear()} INKAI Jawa Timur. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1">
              <span>Integritas • Disiplin • Prestasi</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


