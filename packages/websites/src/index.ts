import { presenceRegistry } from "./.generated/presences.js";
import type { PresenceDefinition, WebsiteMetadata } from "./types.js";

export type {
  PresenceActivity,
  PresenceContext,
  PresenceDefinition,
  WebsiteMetadata,
} from "./types.js";

export const websites: readonly WebsiteMetadata[] = presenceRegistry.map(
  (presence) => presence.metadata,
);

export const listSupportedWebsites = (): readonly WebsiteMetadata[] => websites;

export const listPresences = (): readonly PresenceDefinition[] => presenceRegistry;

export const findWebsiteByHost = (host: string): WebsiteMetadata | undefined =>
  websites.find((website) =>
    website.matchers.some((matcher) => host === matcher || host.endsWith(`.${matcher}`)),
  );

export const findPresenceByHost = (host: string): PresenceDefinition | undefined =>
  presenceRegistry.find((presence) =>
    presence.metadata.matchers.some(
      (matcher) => host === matcher || host.endsWith(`.${matcher}`),
    ),
  );
