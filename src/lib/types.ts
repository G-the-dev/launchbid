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
