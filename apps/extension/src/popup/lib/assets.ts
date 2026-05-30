import type { WebsiteMetadata } from "@dp/websites";

export type SiteAssets = {
  readonly icon: string | null;
  readonly logo: string | null;
  readonly banner: string | null;
};

export const getAssets = (): SiteAssets => ({
  banner: null,
  icon: null,
  logo: null,
});

export const getSiteFallbackLetter = (site: WebsiteMetadata): string =>
  site.displayName.trim().charAt(0).toUpperCase();
