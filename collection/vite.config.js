import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { analyticsPlugin } from "../shared/analytics.js";
import { papers } from "../shared/catalog.js";

export default defineConfig({
  plugins: [analyticsPlugin()],
  root: fileURLToPath(new URL(".", import.meta.url)),
  server: {
    host: "127.0.0.1", port: 5173, strictPort: true,
    proxy: Object.fromEntries(papers.map(paper => [`/${paper.slug}`, { target: `http://127.0.0.1:${paper.devPort}`, ws: true }])),
  },
  build: {
    outDir: "../dist", emptyOutDir: true,
    rolldownOptions: { input: ["index.html", "404.html", "learn/index.html", "about/index.html", "channels/index.html", "privacy/index.html"].map(file => fileURLToPath(new URL(file, import.meta.url))) },
  },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true, proxy: {} },
});
