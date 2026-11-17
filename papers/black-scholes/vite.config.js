import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { analyticsPlugin } from "../../shared/analytics.js";

export default defineConfig({
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
  plugins: [analyticsPlugin()],
  base: "/black-scholes/",
});
