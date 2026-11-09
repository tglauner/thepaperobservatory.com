import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";
import { papers } from "../shared/catalog.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const vite = path.join(
  path.dirname(require.resolve("vite/package.json")),
  "bin/vite.js",
);
const mode = process.argv[2] ?? "dev";
const shouldOpen = process.argv.includes("--open");
if (!["dev", "preview"].includes(mode)) throw new Error("Use dev or preview.");
const port = mode === "dev" ? 5173 : 4173;
const url = `http://127.0.0.1:${port}/`;
const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill("SIGTERM");
  process.exitCode = code;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());

async function ensureAvailable(checkPort) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () =>
      reject(
        new Error(
          `Port ${checkPort} is already in use. Stop the earlier local server, then retry.`,
        ),
      ),
    );
    server.listen(checkPort, "127.0.0.1", () => server.close(resolve));
  });
}

function launch(directory, args) {
  const child = spawn(process.execPath, [vite, ...args], {
    cwd: path.join(root, directory),
    stdio: "inherit",
  });
  children.push(child);
  child.once("error", (error) => {
    console.error(`[paper-library] ${error.message}`);
    stop(1);
  });
  child.once("exit", (code) => {
    if (!stopping) {
      console.error(
        `[paper-library] ${directory} stopped (${code ?? "signal"}).`,
      );
      stop(code || 1);
    }
  });
}

async function waitFor(address) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (stopping) throw new Error("Startup interrupted.");
    try {
      const response = await fetch(address);
      if (response.ok) return;
    } catch {
      /* Server is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Local server did not become ready at ${address}`);
}

try {
  if (mode === "preview") {
    for (const file of [
      "dist/index.html",
      ...papers.map(paper => `dist/${paper.slug}/index.html`),
    ]) {
      if (!existsSync(path.join(root, file)))
        throw new Error(
          `Missing ${file}. Run npm run build before previewing the collection.`,
        );
    }
  }
  for (const checkPort of mode === "dev" ? [5173, ...papers.map(paper => paper.devPort)] : [4173])
    await ensureAvailable(checkPort);
  if (mode === "dev") {
    for (const script of ["social-packs.mjs", "render-pages.mjs"]) {
      const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { cwd: root, stdio: "inherit" });
      if (result.status !== 0) throw new Error(`${script} failed.`);
    }
    for (const paper of papers) launch(`papers/${paper.slug}`, ["--host", "127.0.0.1", "--port", String(paper.devPort), "--strictPort"]);
    launch(".", ["--config", "collection/vite.config.js"]);
  } else launch(".", ["preview", "--config", "collection/vite.config.js"]);
  await waitFor(url);
  if (mode === "dev")
    await Promise.all(papers.map(paper => waitFor(`${url}${paper.slug}/`)));
  console.log(`\n[paper-library] Ready: ${url}`);
  console.log(
    "[paper-library] All paper websites are available from the library. Control-C stops the local servers.\n",
  );
  if (shouldOpen) {
    const command =
      process.platform === "darwin"
        ? "open"
        : process.platform === "win32"
          ? "explorer"
          : "xdg-open";
    const opener = spawn(command, [url], { stdio: "ignore" });
    opener.on("error", (error) =>
      console.error(
        `[paper-library] Browser could not open: ${error.message}. Open ${url} manually.`,
      ),
    );
  }
} catch (error) {
  console.error(`[paper-library] ${error.message}`);
  stop(1);
}
