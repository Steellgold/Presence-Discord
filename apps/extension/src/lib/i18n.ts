const fallbackMessages = {
  extensionName: "Discord Presence",
  extensionDescription: "Share rich presence from supported websites to Discord.",
  popupTitle: "Discord Presence",
  popupStatusLabel: "Status",
  popupStatusReady: "Ready",
  popupSupportedSites: "Supported sites",
  popupLocaleLabel: "Locale",
} as const;

export type MessageKey = keyof typeof fallbackMessages;

const getChromeI18n = (): typeof chrome.i18n | undefined =>
  typeof chrome === "undefined" ? undefined : chrome.i18n;

export const getMessage = (key: MessageKey): string => {
  const localizedMessage = getChromeI18n()?.getMessage(key);

  return localizedMessage === undefined || localizedMessage.length === 0
    ? fallbackMessages[key]
    : localizedMessage;
};

export const getCurrentLocale = (): string =>
  getChromeI18n()?.getUILanguage() ?? "en";
