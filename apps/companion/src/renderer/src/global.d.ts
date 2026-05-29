export {};

declare global {
  interface Window {
    readonly companion: {
      readonly platform: NodeJS.Platform;
    };
  }
}

