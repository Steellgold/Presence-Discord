export type WebsiteDefinition = {
  readonly id: string;
  readonly displayName: string;
  readonly matchers: readonly string[];
};

export const websites = [
  {
    id: "youtube",
    displayName: "YouTube",
    matchers: ["youtube.com", "youtu.be"],
  },
  {
    id: "twitch",
    displayName: "Twitch",
    matchers: ["twitch.tv"],
  },
] as const satisfies readonly WebsiteDefinition[];

export const listSupportedWebsites = (): readonly WebsiteDefinition[] => websites;

export const findWebsiteByHost = (host: string): WebsiteDefinition | undefined =>
  websites.find((website) =>
    website.matchers.some((matcher) => host === matcher || host.endsWith(`.${matcher}`)),
  );

