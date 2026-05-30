import metadata from "./metadata.json" with { type: "json" };
import type { PresenceDefinition } from "../../types.js";

export const spotifyPresence = {
  metadata,
  detect: () => ({
    title: metadata.displayName,
  }),
} as const satisfies PresenceDefinition;

export default spotifyPresence;
