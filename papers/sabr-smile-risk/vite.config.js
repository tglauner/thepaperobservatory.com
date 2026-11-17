import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { analyticsPlugin } from "../../shared/analytics.js";
import { localSourcePlugin } from "../../shared/vite-source.js";

export default defineConfig({
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
  plugins: [localSourcePlugin(import.meta.url), analyticsPlugin()],
  base: "/sabr-smile-risk/",
});
