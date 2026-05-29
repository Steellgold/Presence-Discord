export type WebsiteMetadata = {
  readonly id: string;
  readonly displayName: string;
  readonly matchers: readonly string[];
};

export type PresenceContext = {
  readonly host: string;
  readonly href: string;
};

export type PresenceActivity = {
  readonly title: string;
  readonly details?: string;
};

export type PresenceDefinition = {
  readonly metadata: WebsiteMetadata;
  readonly detect: (context: PresenceContext) => PresenceActivity | undefined;
};

