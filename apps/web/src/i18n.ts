const messages = {
  en: {
    navHome: "Home",
    navWebsites: "Websites",
    navDownload: "Download",
    heroTitle: "Discord Presence",
    heroSubtitle:
      "A browser extension and companion app that share activity from supported websites to Discord.",
    heroPrimaryAction: "View supported websites",
    heroSecondaryAction: "Download companion",
    statusExtension: "Browser extension",
    statusCompanion: "Desktop companion",
    statusWebsites: "Supported websites",
    sectionTitle: "Presence across the apps you actually use",
    sectionBody:
      "The extension detects supported websites, while the companion app handles the local Discord connection.",
    websitesTitle: "Supported websites",
    downloadTitle: "Get started",
    downloadBody: "Install the extension, then run the companion app on your computer.",
  },
  fr: {
    navHome: "Accueil",
    navWebsites: "Sites",
    navDownload: "Telechargement",
    heroTitle: "Discord Presence",
    heroSubtitle:
      "Une extension navigateur et une application compagnon pour partager l'activite des sites compatibles vers Discord.",
    heroPrimaryAction: "Voir les sites compatibles",
    heroSecondaryAction: "Telecharger le compagnon",
    statusExtension: "Extension navigateur",
    statusCompanion: "Application compagnon",
    statusWebsites: "Sites compatibles",
    sectionTitle: "Une presence pour les apps que tu utilises vraiment",
    sectionBody:
      "L'extension detecte les sites compatibles, pendant que l'application compagnon gere la connexion locale avec Discord.",
    websitesTitle: "Sites compatibles",
    downloadTitle: "Demarrer",
    downloadBody: "Installe l'extension, puis lance l'application compagnon sur ton ordinateur.",
  },
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)["en"];

export const supportedLocales = ["en", "fr"] as const satisfies readonly Locale[];

export const getPreferredLocale = (): Locale => {
  const browserLocale = navigator.language.toLowerCase();

  return browserLocale.startsWith("fr") ? "fr" : "en";
};

export const createTranslator = (locale: Locale) => (key: MessageKey): string =>
  messages[locale][key];

