import { listSupportedWebsites } from "@dp/websites";
import type { JSX } from "react";
import { createTranslator, getPreferredLocale } from "./i18n";

const locale = getPreferredLocale();
const t = createTranslator(locale);
const websites = listSupportedWebsites();

const routes = {
  home: "/",
  websites: "/websites",
  download: "/download",
} as const;

const getCurrentPath = (): string => window.location.pathname;

export const App = (): JSX.Element => {
  const path = getCurrentPath();

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#172033]">
      <nav
        className="flex flex-col items-start justify-between gap-6 border-b border-[#e0e6ef] bg-[#f6f8fb]/95 px-5 py-[18px] sm:flex-row sm:items-center lg:px-20"
        aria-label="Main navigation"
      >
        <a className="font-extrabold" href={routes.home}>
          Discord Presence
        </a>
        <div className="flex gap-[18px] text-sm text-[#536079]">
          <a href={routes.home}>{t("navHome")}</a>
          <a href={routes.websites}>{t("navWebsites")}</a>
          <a href={routes.download}>{t("navDownload")}</a>
        </div>
      </nav>

      {path === routes.websites ? <WebsitesPage /> : null}
      {path === routes.download ? <DownloadPage /> : null}
      {path !== routes.websites && path !== routes.download ? <HomePage /> : null}
    </main>
  );
};

const HomePage = (): JSX.Element => (
  <>
    <section className="grid min-h-auto items-center gap-10 bg-[linear-gradient(135deg,rgba(88,101,242,0.16),transparent_42%),#f6f8fb] px-5 py-[60px] lg:min-h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,1fr)_280px] lg:px-20">
      <div className="max-w-[760px]">
        <p className="mb-3.5 text-[13px] font-extrabold uppercase text-[#5865f2]">
          {t("statusExtension")} + {t("statusCompanion")}
        </p>
        <h1 className="m-0 text-[clamp(42px,8vw,88px)] leading-[0.95] tracking-normal">
          {t("heroTitle")}
        </h1>
        <p className="mt-[22px] max-w-[620px] text-xl leading-[1.6] text-[#46536b]">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-11 items-center rounded-lg bg-[#5865f2] px-[18px] font-bold text-white"
            href={routes.websites}
          >
            {t("heroPrimaryAction")}
          </a>
          <a
            className="inline-flex min-h-11 items-center rounded-lg bg-[#e6eaf2] px-[18px] font-bold text-[#25304a]"
            href={routes.download}
          >
            {t("heroSecondaryAction")}
          </a>
        </div>
      </div>
      <div
        className="grid gap-2 rounded-lg border border-[#d9e0eb] bg-white p-[22px]"
        aria-label="Presence preview"
      >
        <span className="text-[#66728a]">{t("statusWebsites")}</span>
        <strong className="text-[56px]">{websites.length}</strong>
      </div>
    </section>

    <section className="bg-[#172033] px-5 py-[70px] text-white lg:px-20">
      <h2 className="m-0 max-w-[760px] text-[38px] tracking-normal">
        {t("sectionTitle")}
      </h2>
      <p className="max-w-[680px] text-lg leading-[1.7] text-[#cbd3e1]">
        {t("sectionBody")}
      </p>
    </section>
  </>
);

const WebsitesPage = (): JSX.Element => (
  <section className="px-5 py-[70px] lg:px-20">
    <h1 className="m-0 max-w-[760px] text-[clamp(42px,8vw,88px)] leading-[0.95] tracking-normal">
      {t("websitesTitle")}
    </h1>
    <ul className="mt-[34px] grid max-w-[720px] list-none gap-3 p-0">
      {websites.map((website) => (
        <li
          className="flex flex-col gap-[18px] rounded-lg border border-[#d9e0eb] bg-white px-[18px] py-4 sm:flex-row sm:justify-between"
          key={website.id}
        >
          <strong>{website.displayName}</strong>
          <span className="text-[#66728a]">{website.matchers.join(", ")}</span>
        </li>
      ))}
    </ul>
  </section>
);

const DownloadPage = (): JSX.Element => (
  <section className="px-5 py-[70px] lg:px-20">
    <h1 className="m-0 max-w-[760px] text-[clamp(42px,8vw,88px)] leading-[0.95] tracking-normal">
      {t("downloadTitle")}
    </h1>
    <p className="max-w-[680px] text-lg leading-[1.7] text-[#46536b]">
      {t("downloadBody")}
    </p>
  </section>
);
