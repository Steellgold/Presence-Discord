import { contextBridge } from "electron";

const companionApi = {
  platform: process.platform,
} as const;

contextBridge.exposeInMainWorld("companion", companionApi);

