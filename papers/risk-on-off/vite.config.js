import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { localSourcePlugin } from "../../shared/vite-source.js";

export default defineConfig({
  envDir: fileURLToPath(new URL("../../", import.meta.url)),
  plugins: [localSourcePlugin(import.meta.url)],
  base: "/risk-on-off/",
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "math-typesetting",
              test: /node_modules[\\/]katex/,
              priority: 20,
            },
            {
              name: "react-runtime",
              test: /node_modules[\\/](react|react-dom|scheduler)/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
