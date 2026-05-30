import type { WebsiteMetadata } from "@dp/websites";

export type SiteAssets = {
  readonly icon: string | null;
  readonly logo: string | null;
  readonly banner: string | null;
};

export const getAssets = (_site: WebsiteMetadata): SiteAssets => ({
  icon: null,
  logo: null,
  banner: null,
});

export const getSiteInitial = (site: WebsiteMetadata): string =>
  site.displayName.trim().charAt(0).toUpperCase();
