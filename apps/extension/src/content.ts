const supportedMatchers = ["youtube.com", "youtu.be", "twitch.tv"] as const;

export const detectCurrentWebsite = (host: string): string | undefined =>
  supportedMatchers.find((matcher) => host === matcher || host.endsWith(`.${matcher}`));

export const currentWebsiteId = detectCurrentWebsite(globalThis.location.host);
