import enUS from "../locales/en-US.json";
import frFR from "../locales/fr-FR.json";

export type Locale = "en-US" | "fr-FR";

const STORAGE_LOCALE_KEY = "dp_popup_locale";
const FALLBACK_LOCALE: Locale = "fr-FR";

export const messages = {
  "en-US": enUS,
  "fr-FR": frFR,
} as const;

export type MessageKey = keyof typeof frFR;

const isLocale = (value: string): value is Locale => value === "en-US" || value === "fr-FR";

const normalizeLocale = (value: string | undefined): Locale | undefined => {
  if (value === undefined) return undefined;
  if (isLocale(value)) return value;
  const lower = value.toLowerCase();
  if (lower.startsWith("fr")) return "fr-FR";
  if (lower.startsWith("en")) return "en-US";
  return undefined;
};

const getChromeLocale = (): string | undefined => {
  if (typeof globalThis.chrome === "undefined") return undefined;
  return globalThis.chrome.i18n.getUILanguage();
};

export const getStoredLocale = (): Locale | undefined => {
  if (typeof localStorage === "undefined") return undefined;
  try {
    return normalizeLocale(localStorage.getItem(STORAGE_LOCALE_KEY) ?? undefined);
  } catch {
    return undefined;
  }
};

export const setStoredLocale = (locale: Locale): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_LOCALE_KEY, locale);
  } catch {
    // Storage can be unavailable in hardened browser contexts.
  }
};

export const getCurrentLocale = (): Locale =>
  getStoredLocale() ??
  normalizeLocale(getChromeLocale()) ??
  normalizeLocale(typeof navigator === "undefined" ? undefined : navigator.language) ??
  FALLBACK_LOCALE;

export const getMessage = (key: MessageKey, locale: Locale = getCurrentLocale()): string =>
  messages[locale][key];

export const formatMessage = (
  key: MessageKey,
  replacements: Record<string, string | number>,
  locale: Locale = getCurrentLocale(),
): string =>
  Object.entries(replacements).reduce(
    (message, [name, value]) => message.replaceAll(`$${name}$`, String(value)),
    getMessage(key, locale),
  );

export const createTranslator = (locale: Locale) => ({
  f: (key: MessageKey, replacements: Record<string, string | number>) =>
    formatMessage(key, replacements, locale),
  t: (key: MessageKey) => getMessage(key, locale),
});
