import type { ReactNode } from "react";
import { NavLink } from "./_components/nav-link";
import { PortalShell } from "../_components/portal-shell";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalShell
      homeHref="/"
      navItems={[
        { href: "/profil", label: "Profil" },
        { href: "/berita", label: "Berita" },
        { href: "/agenda", label: "Agenda" },
        { href: "/dojo", label: "Dojo" },
        { href: "/dokumen", label: "Dokumen" },
      ]}
      NavLinkComponent={NavLink}
    >
      {children}
    </PortalShell>
  );
}
