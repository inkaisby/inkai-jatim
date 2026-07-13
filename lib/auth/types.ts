export type PortalRoleName =
  | "ADMIN_PUSAT"
  | "ADMIN_PROVINCE"
  | "ADMIN_BRANCH"
  | "ADMIN_DOJO"
  | "ADMINISTRATOR"
  | "ADMIN"
  | "MEMBER"
  | "PARENT";

export type PortalScope = {
  provinceId: string | null;
  branchId: string | null;
  dojoId: string | null;
};

export type PortalSessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  roles: PortalRoleName[];
  scope: PortalScope;
  profileStatus: "pending" | "approved" | "rejected" | null;
};

export type PortalSessionPayload = PortalSessionUser & {
  exp: number;
};
