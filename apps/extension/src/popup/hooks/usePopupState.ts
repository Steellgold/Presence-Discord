import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "../../lib/i18n";
import { getCurrentLocale, setStoredLocale } from "../../lib/i18n";

export type ThemeChoice = "dark" | "light" | "auto";
export type CompanionStatus = "ok" | "offline" | "error";
export type DiscordStatus = "online" | "idle" | "dnd" | "offline";
export type TabId = "default" | "settings";

const duration = 166;

const resolveTheme = (theme: ThemeChoice): "dark" | "light" => {
  if (theme !== "auto") return theme;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

export const usePopupState = () => {
  const [tab, setTab] = useState<TabId>("default");
  const [query, setQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(8);
  const [isHiddenOpen, setIsHiddenOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeChoice>("dark");
  const [blur, setBlur] = useState(22);
  const [locale, setLocaleState] = useState<Locale>(() => getCurrentLocale());
  const [companionStatus, setCompanionStatusState] = useState<CompanionStatus>("offline");
  const [companionError, setCompanionError] = useState<string | undefined>();
  const [discordAccount, setDiscordAccountState] = useState({
    avatarUrl: "",
    name: "",
    status: "offline" as DiscordStatus,
    tag: "",
  });

  useEffect(() => {
    const apply = () => { document.documentElement.setAttribute("data-theme", resolveTheme(theme)); };
    apply();
    if (theme !== "auto") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", apply);
    return () => { media.removeEventListener("change", apply); };
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale.startsWith("fr") ? "fr" : "en";
  }, [locale]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 1;
        if (next >= duration) {
          window.clearInterval(timer);
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
    }, 1000);
    return () => { window.clearInterval(timer); };
  }, [isPlaying]);

  useEffect(() => {
    window.setDiscordAccount = (name, tag, avatarUrl, status) => {
      setDiscordAccountState({ avatarUrl, name, status, tag });
    };
    window.setCompanionStatus = (status, errorMsg) => {
      setCompanionStatusState(status);
      setCompanionError(errorMsg);
    };
    return () => {
      delete window.setDiscordAccount;
      delete window.setCompanionStatus;
    };
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setStoredLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  return useMemo(
    () => ({
      blur,
      companionError,
      companionStatus,
      discordAccount,
      duration,
      isHiddenOpen,
      isPlaying,
      locale,
      progress,
      query,
      setBlur,
      setCompanionStatusState,
      setIsHiddenOpen,
      setIsPlaying,
      setLocale,
      setProgress,
      setQuery,
      setTab,
      setTheme,
      tab,
      theme,
    }),
    [blur, companionError, companionStatus, discordAccount, isHiddenOpen, isPlaying, locale, progress, query, setLocale, tab, theme],
  );
};

declare global {
  interface Window {
    setDiscordAccount?: (name: string, tag: string, avatarUrl: string, status: DiscordStatus) => void;
    setCompanionStatus?: (status: CompanionStatus, errorMsg?: string) => void;
  }
}
