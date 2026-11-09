import { existsSync } from "node:fs";

// Codespaces/public clones do not contain the locally preserved source PDFs.
export function localSourcePlugin(configUrl) {
  return {
    name: "private-local-source-availability",
    config(_config, { command }) {
      return { define: { "import.meta.env.LOCAL_SOURCE_AVAILABLE": JSON.stringify(command === "serve" && existsSync(new URL("public/paper.pdf", configUrl))) } };
    },
  };
}
