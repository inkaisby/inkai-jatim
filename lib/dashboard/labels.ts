import type { PortalRoleName } from "@/lib/auth/types";

export const ROLE_LABELS: Record<PortalRoleName, string> = {
  ADMIN_PUSAT: "Administrator Pusat",
  ADMIN_PROVINCE: "Admin Provinsi",
  ADMIN_BRANCH: "Admin Cabang",
  ADMIN_DOJO: "Admin Dojo/Ranting",
  ADMINISTRATOR: "Administrator",
  ADMIN: "Admin",
  MEMBER: "Anggota",
  PARENT: "Orang Tua/Wali",
};

export function getPrimaryRoleLabel(roles: PortalRoleName[]) {
  const priority: PortalRoleName[] = [
    "ADMIN_PUSAT",
    "ADMINISTRATOR",
    "ADMIN",
    "ADMIN_PROVINCE",
    "ADMIN_BRANCH",
    "ADMIN_DOJO",
    "PARENT",
    "MEMBER",
  ];

  for (const role of priority) {
    if (roles.includes(role)) return ROLE_LABELS[role];
  }

  return "Pengguna";
}

export function getHierarchyLevel(roles: PortalRoleName[]) {
  if (roles.some((r) => ["ADMIN_PUSAT", "ADMINISTRATOR", "ADMIN"].includes(r))) {
    return "nasional" as const;
  }
  if (roles.includes("ADMIN_PROVINCE")) return "provinsi" as const;
  if (roles.includes("ADMIN_BRANCH")) return "cabang" as const;
  if (roles.includes("ADMIN_DOJO")) return "dojo" as const;
  return "anggota" as const;
}
