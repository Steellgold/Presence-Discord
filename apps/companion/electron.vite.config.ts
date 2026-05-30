import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

const appRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  main: {
    build: {
      externalizeDeps: true,
      rollupOptions: {
        input: resolve(appRoot, "src/main/index.ts"),
      },
    },
  },
  preload: {
    build: {
      externalizeDeps: true,
      rollupOptions: {
        input: resolve(appRoot, "src/preload/index.ts"),
      },
    },
  },
  renderer: {
    plugins: [react()],
    root: resolve(appRoot, "src/renderer"),
  },
});
