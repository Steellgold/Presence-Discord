import { createLogger } from "@dp/utils";
import { app, BrowserWindow, Menu, Tray, nativeImage } from "electron";
import { join } from "node:path";

const logger = createLogger("companion-main");
const trayIconSvg =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%235865F2'/><circle cx='11' cy='14' r='2.5' fill='white'/><circle cx='21' cy='14' r='2.5' fill='white'/><path d='M10 21c4 2.5 8 2.5 12 0' stroke='white' stroke-width='2.4' stroke-linecap='round' fill='none'/></svg>";

let isQuitting = false;
let mainWindow: BrowserWindow | undefined;
let tray: Tray | undefined;

const showMainWindow = (): void => {
  const window = mainWindow ?? createMainWindow();

  window.show();
  window.focus();
};

const createMainWindow = (): BrowserWindow => {
  if (mainWindow !== undefined && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  const window = new BrowserWindow({
    height: 720,
    minHeight: 520,
    minWidth: 720,
    show: false,
    skipTaskbar: true,
    title: "Discord Presence Companion",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, "../preload/index.js"),
    },
    width: 1040,
  });

  window.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      window.hide();
    }
  });

  window.on("closed", () => {
    mainWindow = undefined;
  });

  if (process.env.ELECTRON_RENDERER_URL !== undefined) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow = window;

  return mainWindow;
};

const createTray = (): Tray => {
  const image = nativeImage.createFromDataURL(trayIconSvg);
  const appTray = new Tray(image.resize({ height: 16, width: 16 }));

  appTray.setToolTip("Discord Presence Companion");
  appTray.setContextMenu(
    Menu.buildFromTemplate([
      {
        click: showMainWindow,
        label: "Open Discord Presence",
      },
      {
        type: "separator",
      },
      {
        click: () => {
          isQuitting = true;
          app.quit();
        },
        label: "Quit",
      },
    ]),
  );
  appTray.on("double-click", showMainWindow);

  tray = appTray;

  return appTray;
};

void app.whenReady().then(() => {
  logger.info("Starting companion app");
  app.setAppUserModelId("dev.dp.companion");
  createTray();
  createMainWindow();

  app.on("activate", () => {
    showMainWindow();
  });
});

app.on("window-all-closed", () => {
  logger.info("All windows hidden; companion is still running", {
    hasTray: tray !== undefined,
  });
});

app.on("before-quit", () => {
  isQuitting = true;
});
