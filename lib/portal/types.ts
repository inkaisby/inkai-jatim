export type PortalVisibility = "public" | "internal";
export type PortalStatus = "draft" | "review" | "published" | "archived";

export type PortalPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_path: string | null;
  status: PortalStatus;
  visibility: PortalVisibility;
  is_pinned: boolean | null;
  pinned_order: number | null;
  published_at: string | null;
  created_at: string;
};

export type PortalEvent = {
  id: string;
  title: string;
  slug: string;
  type: string | null;
  start_at: string;
  end_at: string | null;
  location_text: string | null;
  status: PortalStatus;
  visibility: PortalVisibility;
  published_at: string | null;
  created_at: string;
};

export type PortalDojo = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  status: "active" | "inactive";
  visibility: PortalVisibility;
  created_at: string;
};

