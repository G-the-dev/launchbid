export type Product = {
  id: string;
  owner_id: string;
  url: string;
  slug: string;
  name: string;
  tagline: string | null;
  favicon_url: string | null;
  total_amount: number;
  boost_count: number;
  click_count: number;
  last_boost_at: string | null;
  created_at: string;
};

export type TokenEvent = {
  id: string;
  delta: number;
  kind: "welcome" | "share_x" | "visit" | "purchase" | "boost" | "spawn";
  created_at: string;
};

export type BoostWithProfile = {
  id: string;
  amount: number;
  created_at: string;
  profiles: { display_name: string | null } | null;
};

export type SiteMetadata = {
  url: string;
  name: string;
  tagline: string;
  faviconUrl: string;
};
