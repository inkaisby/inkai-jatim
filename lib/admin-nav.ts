export type NavLink = {
  href: string;
  label: string;
};

export type NavGroup = {
  label: string;
  children: NavLink[];
};

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item && Array.isArray(item.children);
}

/** Mirror inkai-sby ADMIN_LINKS — label & struktur sama, scope data Jawa Timur. */
export const ADMIN_LINKS: NavItem[] = [
  { href: "/admin", label: "Beranda Admin" },
  {
    label: "Keanggotaan",
    children: [
      { href: "/admin/anggota", label: "Kelola Anggota" },
      { href: "/admin/verifikasi", label: "Verifikasi" },
      { href: "/admin/organisasi", label: "Organisasi" },
    ],
  },
  {
    label: "Keuangan & UKT",
    children: [
      { href: "/admin/iuran", label: "Iuran Anggota" },
      { href: "/admin/ukt", label: "UKT" },
    ],
  },
  {
    label: "Kegiatan & Absensi",
    children: [
      { href: "/admin/kegiatan", label: "Event & Kegiatan" },
      { href: "/admin/absensi", label: "Absensi" },
    ],
  },
  {
    label: "Konten & Layanan",
    children: [
      { href: "/admin/materi", label: "Materi Digital" },
      { href: "/admin/store", label: "Store" },
      { href: "/admin/pesan", label: "Pesan" },
      { href: "/admin/carousel", label: "Carousel Beranda" },
      { href: "/admin/notifikasi", label: "Notifikasi" },
    ],
  },
  {
    label: "Sistem",
    children: [
      { href: "/admin/audit", label: "Log Audit" },
      { href: "/admin/pengaturan", label: "Ringkasan Pengaturan" },
      { href: "/admin/pengaturan/user", label: "Pengaturan User" },
      { href: "/admin/pengaturan/cabang", label: "Pengaturan Cabang" },
      { href: "/admin/pengaturan/ranting", label: "Pengaturan Ranting" },
      { href: "/admin/pengaturan/kebijakan", label: "Profil & Kebijakan" },
      { href: "/admin/pengaturan/peran", label: "Role & Hak Akses" },
      { href: "/admin/pengaturan/geofencing", label: "Geofencing Absensi" },
      { href: "/admin/pengaturan/akun", label: "Akun Saya" },
    ],
  },
];

export function getAdminNavLinks(roles: string[]): NavItem[] {
  const isDojoOnly =
    roles.includes("ADMIN_DOJO") &&
    !roles.some((r) =>
      ["ADMIN_PUSAT", "ADMINISTRATOR", "ADMIN", "ADMIN_PROVINCE", "ADMIN_BRANCH"].includes(r),
    );

  if (!isDojoOnly) return ADMIN_LINKS;

  return [
    { href: "/admin", label: "Beranda Admin" },
    {
      label: "Keanggotaan",
      children: [
        { href: "/admin/anggota", label: "Kelola Anggota" },
        { href: "/admin/verifikasi", label: "Verifikasi" },
      ],
    },
    {
      label: "Keuangan & UKT",
      children: [
        { href: "/admin/iuran", label: "Iuran Anggota" },
        { href: "/admin/ukt", label: "UKT" },
      ],
    },
    {
      label: "Kegiatan & Absensi",
      children: [
        { href: "/admin/kegiatan", label: "Event & Kegiatan" },
        { href: "/admin/absensi", label: "Absensi" },
      ],
    },
    {
      label: "Konten & Layanan",
      children: [
        { href: "/admin/materi", label: "Materi Digital" },
        { href: "/admin/store", label: "Store" },
        { href: "/admin/pesan", label: "Pesan" },
        { href: "/admin/notifikasi", label: "Notifikasi" },
      ],
    },
    { href: "/admin/pengaturan", label: "Pengaturan" },
  ];
}

export function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/pengaturan") {
    return pathname === "/admin/pengaturan";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
