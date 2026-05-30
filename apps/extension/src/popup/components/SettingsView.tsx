import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { formatMessage, getMessage, setStoredLocale, type Locale } from "../../lib/i18n";
import { SettingsCard, SettingsGroup, Toggle } from "./common";
import { AlertIcon, ExternalIcon, EyeIcon, GithubLineIcon, GlobeIcon, MonitorIcon, MoonIcon, SettingsIcon, SunIcon, UserIcon, UsersIcon } from "./Icons";

type ThemeChoice = "dark" | "light" | "auto";

type UpdateState = "up-to-date" | "checking" | "update-available" | "error";

const SettingsRow = ({ icon, label, sub, action, clickable = false, style, onClick }: { readonly icon: ReactNode; readonly label: string; readonly sub: string; readonly action?: ReactNode; readonly clickable?: boolean; readonly style?: CSSProperties; readonly onClick?: () => void }) => (
  <div className={`settings-row ${clickable ? "clickable" : ""}`} style={style} onClick={onClick}>
    <div className="settings-row-icon">{icon}</div>
    <div className="settings-row-info"><div className="settings-row-label">{label}</div><div className="settings-row-sub">{sub}</div></div>
    {action !== undefined && <div className="settings-row-action">{action}</div>}
  </div>
);

const ThemeSelector = ({ theme, onThemeChange }: { readonly theme: ThemeChoice; readonly onThemeChange: (theme: ThemeChoice) => void }) => {
  const options: readonly [ThemeChoice, ReactNode, string][] = [
    ["dark", <MoonIcon key="dark" />, getMessage("settings.theme.dark")],
    ["light", <SunIcon key="light" />, getMessage("settings.theme.light")],
    ["auto", <MonitorIcon key="auto" />, getMessage("settings.theme.auto")],
  ];
  return <div className="theme-inline-options">{options.map(([value, icon, label]) => <div key={value} className={`theme-chip ${theme === value ? "selected" : ""}`} data-value={value} onClick={() => onThemeChange(value)}>{icon}{label}</div>)}</div>;
};

const LanguageSelector = () => {
  const [locale, setLocale] = useState<Locale>("fr-FR");
  const choose = (next: Locale) => { setLocale(next); setStoredLocale(next); };
  return <div className="lang-options"><div className={`lang-chip ${locale === "fr-FR" ? "selected" : ""}`} data-lang="fr" onClick={() => choose("fr-FR")}>{getMessage("settings.language.fr", locale)}</div><div className="lang-chip" data-lang="en" onClick={() => choose("en-US")} style={{ opacity: ".45", cursor: "default" }} title={getMessage("settings.language.soonTitle", locale)}>{getMessage("settings.language.en", locale)} <span style={{ fontSize: "9px", opacity: ".6" }}>{getMessage("settings.language.soon", locale)}</span></div></div>;
};

const UpdateCard = () => {
  const [status, setStatus] = useState<UpdateState>("up-to-date");
  const [text, setText] = useState(getMessage("settings.update.ok"));
  const [sub, setSub] = useState(getMessage("settings.update.latest").replace("$current$", getMessage("app.version")));
  const [latest, setLatest] = useState("");
  const [busy, setBusy] = useState(false);
  const checkUpdate = async () => {
    setBusy(true); setStatus("checking"); setText(getMessage("settings.update.checking"));
    try {
      const response = await fetch("https://api.github.com/repos/presences-app/presences/releases/latest");
      const data = await response.json() as { readonly tag_name?: string; readonly name?: string };
      const next = data.tag_name ?? data.name ?? getMessage("app.version");
      const current = getMessage("app.version");
      if (next === current) { setStatus("up-to-date"); setText(getMessage("settings.update.ok")); setSub(formatMessage("settings.update.latest", { current })); }
      else { setStatus("update-available"); setText(getMessage("settings.update.available")); setSub(formatMessage("settings.update.availableSub", { current, latest: next })); setLatest(next); }
    } catch {
      setStatus("error"); setText(getMessage("settings.update.error")); setSub(getMessage("settings.update.errorSub"));
    } finally { setBusy(false); }
  };
  return <SettingsGroup label={getMessage("settings.update.group")}><SettingsCard><div className="settings-row"><div className="settings-row-icon"><SettingsIcon /></div><div className="settings-row-info"><div className="settings-row-label">{getMessage("settings.update.label")}</div><div className="settings-row-sub">{sub}</div></div><div className="settings-row-action"><span className={`update-status ${status}`}><span className="update-status-dot" /><span>{text}</span></span><button className="btn-sm" disabled={busy} onClick={checkUpdate} type="button">{busy ? getMessage("settings.update.busy") : getMessage("settings.update.check")}</button></div></div>{latest !== "" && <div className="settings-row" style={{ display: "flex" }}><div className="settings-row-info"><div className="settings-row-label">{formatMessage("settings.update.newVersion", { version: latest })}</div></div><div className="settings-row-action"><a className="btn-sm accent" href="https://presences.app/releases" target="_blank">{getMessage("settings.update.download")}</a></div></div>}</SettingsCard></SettingsGroup>;
};

const DebugCard = ({ activeCount, totalCount }: { readonly activeCount: number; readonly totalCount: number }) => {
  const items = [[getMessage("settings.debug.extension"), getMessage("app.version"), "ok"], [getMessage("settings.debug.companion"), getMessage("settings.debug.notConnected"), "warn"], [getMessage("settings.debug.ws"), getMessage("settings.debug.wsClosed"), "err"], [getMessage("settings.debug.rpc"), getMessage("settings.debug.rpcIdle"), "err"], [getMessage("settings.debug.active"), `${activeCount} / ${totalCount}`, ""], [getMessage("settings.debug.latency"), getMessage("settings.debug.empty"), ""]] as const;
  return <SettingsGroup label={getMessage("settings.debug.group")}><SettingsCard><div className="debug-grid">{items.map(([key, value, tone]) => <div className="debug-item" key={key}><div className="debug-key">{key}</div><div className={`debug-val ${tone}`}>{value}</div></div>)}</div></SettingsCard></SettingsGroup>;
};

export const SettingsView = ({ active, blur, onBlurChange, theme, onThemeChange, activeCount, totalCount }: { readonly active: boolean; readonly blur: number; readonly onBlurChange: (blur: number) => void; readonly theme: ThemeChoice; readonly onThemeChange: (theme: ThemeChoice) => void; readonly activeCount: number; readonly totalCount: number }) => (
  <div className={`view ${active ? "active" : ""}`} id="view-settings">
    <div className="settings-scroll">
      <SettingsGroup label={getMessage("settings.discord.group")}><SettingsCard><div className="discord-account-card"><div className="discord-big-avatar"><div className="discord-big-avatar-inner"><UserIcon /></div><span className="discord-big-status offline" /></div><div className="discord-account-info"><div className="discord-account-name">{getMessage("settings.discord.name")}</div><div className="discord-account-tag">{getMessage("settings.discord.tag")}</div></div><button className="btn-sm" onClick={() => window.alert(getMessage("alert.discord"))} type="button">{getMessage("settings.discord.change")}</button></div></SettingsCard></SettingsGroup>
      <SettingsGroup label={getMessage("settings.appearance.group")}><SettingsCard><SettingsRow icon={<SunIcon />} label={getMessage("settings.theme.label")} sub={getMessage("settings.theme.sub")} style={{ paddingBottom: "4px" }} /><ThemeSelector theme={theme} onThemeChange={onThemeChange} /><div style={{ borderTop: "1px solid var(--border)" }}><div className="slider-row"><div className="slider-row-top"><span className="slider-label"><EyeIcon />{getMessage("settings.blur.label")}</span><span className="slider-value">{formatMessage("settings.blur.value", { value: blur })}</span></div><input type="range" min="0" max="40" value={blur} step="1" onChange={(event) => onBlurChange(Number(event.currentTarget.value))} /></div></div></SettingsCard></SettingsGroup>
      <SettingsGroup label={getMessage("settings.language.group")}><SettingsCard><SettingsRow icon={<GlobeIcon />} label={getMessage("settings.language.label")} sub={getMessage("settings.language.sub")} style={{ paddingBottom: "4px" }} /><LanguageSelector /></SettingsCard></SettingsGroup>
      <SettingsGroup label={getMessage("settings.presences.group")}><SettingsCard><SettingsRow icon={<GlobeIcon />} label={getMessage("settings.presences.browse")} sub={getMessage("settings.presences.browseSub")} action={<ExternalIcon />} clickable onClick={() => window.open("https://presences.app", "_blank")} /><SettingsRow icon={<SettingsIcon />} label={getMessage("settings.detection.label")} sub={getMessage("settings.detection.sub")} action={<Toggle checked />} /><SettingsRow icon={<AlertIcon />} label={getMessage("settings.notifications.label")} sub={getMessage("settings.notifications.sub")} action={<Toggle checked />} /><SettingsRow icon={<GlobeIcon />} label={getMessage("settings.sync.label")} sub={getMessage("settings.sync.sub")} action={<Toggle checked />} /><SettingsRow icon={<UsersIcon />} label={getMessage("settings.privacy.label")} sub={getMessage("settings.privacy.sub")} action={<Toggle />} /></SettingsCard></SettingsGroup>
      <UpdateCard />
      <DebugCard activeCount={activeCount} totalCount={totalCount} />
      <SettingsGroup label={getMessage("settings.links.group")}><SettingsCard><div className="ext-links"><a className="ext-link-btn" href="https://github.com/presences-app/presences" target="_blank"><GithubLineIcon />{getMessage("settings.links.github")}</a><a className="ext-link-btn" href="https://github.com/presences-app/presences/issues" target="_blank"><AlertIcon />{getMessage("settings.links.issues")}</a><a className="ext-link-btn" href="https://github.com/presences-app/presences/blob/main/CONTRIBUTING.md" target="_blank"><UsersIcon />{getMessage("settings.links.contribute")}</a></div></SettingsCard></SettingsGroup>
      <div style={{ height: "4px" }} />
    </div>
  </div>
);
