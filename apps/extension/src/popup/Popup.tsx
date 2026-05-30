import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import { DefaultView } from "./components/DefaultView";
import { Header } from "./components/Header";
import { SettingsView } from "./components/SettingsView";
import { Tabs, type ViewId } from "./components/Tabs";
import { useSites } from "./hooks/useSites";

type ThemeChoice = "dark" | "light" | "auto";

const resolveTheme = (theme: ThemeChoice): "dark" | "light" => {
  if (theme !== "auto") return theme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const Popup = (): JSX.Element => {
  const [activeView, setActiveView] = useState<ViewId>("default");
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [blur, setBlur] = useState(22);
  const sites = useSites();
  const activeCount = useMemo(() => sites.filter((site) => site.active).length, [sites]);
  const visibleCount = useMemo(() => sites.filter((site) => !site.hidden).length, [sites]);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.lang = resolved === "dark" ? "fr" : "fr";
    };
    apply();
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return (
    <div className="popup">
      <Header companionStatus="offline" />
      <Tabs activeView={activeView} onSelect={setActiveView} />
      <DefaultView active={activeView === "default"} sites={sites} blur={blur} />
      <SettingsView active={activeView === "settings"} blur={blur} onBlurChange={setBlur} theme={theme} onThemeChange={setTheme} activeCount={activeCount} totalCount={visibleCount} />
    </div>
  );
};
