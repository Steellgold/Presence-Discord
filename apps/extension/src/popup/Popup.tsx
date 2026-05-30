import { listSupportedWebsites } from "@dp/websites";
import type { JSX } from "react";
import { createTranslator } from "../lib/i18n";
import { DefaultView, Header, SettingsView, Tabs } from "./components/PopupSections";
import { usePopupState } from "./hooks/usePopupState";

const websites = listSupportedWebsites();

export const Popup = (): JSX.Element => {
  const state = usePopupState();
  const { t } = createTranslator(state.locale);

  return (
    <div className="popup">
      <Header
        companionError={state.companionError}
        companionStatus={state.companionStatus}
        discordAvatarUrl={state.discordAccount.avatarUrl}
        discordStatus={state.discordAccount.status}
        t={t}
      />
      <Tabs activeTab={state.tab} onChange={state.setTab} t={t} />
      <DefaultView
        blur={state.blur}
        duration={state.duration}
        isActive={state.tab === "default"}
        isHiddenOpen={state.isHiddenOpen}
        isPlaying={state.isPlaying}
        onBlurChange={state.setBlur}
        onHiddenToggle={() => { state.setIsHiddenOpen(!state.isHiddenOpen); }}
        onProgressChange={state.setProgress}
        onQueryChange={state.setQuery}
        onTogglePlay={() => { state.setIsPlaying(!state.isPlaying); }}
        progress={state.progress}
        query={state.query}
        t={t}
      />
      <SettingsView
        activeCount={websites.length}
        blur={state.blur}
        companionStatus={state.companionStatus}
        discordAccount={state.discordAccount}
        isActive={state.tab === "settings"}
        locale={state.locale}
        onBlurChange={state.setBlur}
        onLocaleChange={state.setLocale}
        onThemeChange={state.setTheme}
        t={t}
        theme={state.theme}
        totalCount={websites.length}
      />
    </div>
  );
};
