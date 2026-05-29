import { listSupportedWebsites } from "@dp/websites";
import type { JSX } from "react";
import { getCurrentLocale, getMessage } from "../lib/i18n";

const supportedWebsites = listSupportedWebsites();

export const Popup = (): JSX.Element => (
  <main className="extension-bg grid w-80 gap-4 p-[18px] text-foreground">
    <header className="flex items-center gap-2.5">
      <span
        className="size-2.5 rounded-full bg-success shadow-[0_0_0_4px_rgba(35,165,90,0.16)]"
        aria-hidden="true"
      />
      <h1 className="m-0 text-lg font-bold tracking-normal">{getMessage("popupTitle")}</h1>
    </header>

    <dl className="m-0 grid gap-2.5">
      <div className="flex min-h-[42px] items-center justify-between rounded-lg border border-border bg-white/5 px-3 py-2.5">
        <dt className="m-0 text-[13px] tracking-normal text-muted-foreground">
          {getMessage("popupStatusLabel")}
        </dt>
        <dd className="m-0 text-[13px] font-bold tracking-normal text-white">
          {getMessage("popupStatusReady")}
        </dd>
      </div>
      <div className="flex min-h-[42px] items-center justify-between rounded-lg border border-border bg-white/5 px-3 py-2.5">
        <dt className="m-0 text-[13px] tracking-normal text-muted-foreground">
          {getMessage("popupSupportedSites")}
        </dt>
        <dd className="m-0 text-[13px] font-bold tracking-normal text-white">
          {supportedWebsites.length}
        </dd>
      </div>
      <div className="flex min-h-[42px] items-center justify-between rounded-lg border border-border bg-white/5 px-3 py-2.5">
        <dt className="m-0 text-[13px] tracking-normal text-muted-foreground">
          {getMessage("popupLocaleLabel")}
        </dt>
        <dd className="m-0 text-[13px] font-bold tracking-normal text-white">
          {getCurrentLocale()}
        </dd>
      </div>
    </dl>
  </main>
);
