import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  publicDir: "public",
  build: {
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      input: {
        background: resolve(appRoot, "src/background.ts"),
        content: resolve(appRoot, "src/content.ts"),
        popup: resolve(appRoot, "popup.html"),
      },
      output: {
        assetFileNames: "assets/[name][extname]",
        chunkFileNames: "assets/[name].js",
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "background" || chunkInfo.name === "content"
            ? "[name].js"
            : "assets/[name].js",
      },
    },
  },
});
