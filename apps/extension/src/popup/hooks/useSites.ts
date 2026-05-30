import { listSupportedWebsites } from "@dp/websites";
import { useMemo } from "react";
import { getMessage } from "../../lib/i18n";

const activePresenceById: Record<string, "presence.activity.youtube" | "presence.activity.spotify"> = {
  youtube: "presence.activity.youtube",
  spotify: "presence.activity.spotify",
};

const hiddenPresenceIds = new Set(["github", "crunchyroll"]);
const popupOrder = ["youtube", "spotify", "netflix", "twitch", "github", "crunchyroll"];

export type PopupSite = ReturnType<typeof listSupportedWebsites>[number] & {
  readonly active: boolean;
  readonly enabled: boolean;
  readonly hidden: boolean;
  readonly subtitleKey?: "service.noActivity" | "service.hidden";
  readonly activity?: string;
};

export const useSites = (): readonly PopupSite[] =>
  useMemo(
    () =>
      [...listSupportedWebsites()].sort((left, right) => popupOrder.indexOf(left.id) - popupOrder.indexOf(right.id)).map((site) => {
        const activityKey = activePresenceById[site.id];
        const activity = activityKey === undefined ? undefined : getMessage(activityKey);
        const hidden = hiddenPresenceIds.has(site.id);
        return {
          ...site,
          active: activity !== undefined,
          enabled: activity !== undefined,
          hidden,
          ...(activity === undefined ? {} : { activity }),
          ...(hidden ? { subtitleKey: "service.hidden" as const } : activity === undefined ? { subtitleKey: "service.noActivity" as const } : {}),
        };
      }),
    [],
  );
