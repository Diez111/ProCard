import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.js",
      },
    ]),
    renderer(),
  ],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  optimizeDeps: {
    include: ["vite-plugin-electron", "vite-plugin-electron-renderer"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
