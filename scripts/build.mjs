import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { papers } from "../shared/catalog.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const vite = path.join(path.dirname(require.resolve("vite/package.json")), "bin/vite.js");
function run(command, directory = ".") {
  const result = spawnSync(process.execPath, command, { cwd: path.join(root, directory), stdio: "inherit" });
  if (result.error || result.status !== 0) throw result.error ?? new Error(`Build step failed in ${directory}.`);
}
function removeUnlicensedPdfs(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Build contains a symbolic link: ${file}`);
    if (entry.isDirectory()) removeUnlicensedPdfs(file);
    else if (/\.pdf$/i.test(entry.name)) rmSync(file);
  }
}
try {
  run([path.join(root, "scripts/social-packs.mjs")]);
  run([path.join(root, "scripts/render-pages.mjs")]);
  for (const { slug } of papers) {
    run([vite, "build"], `papers/${slug}`);
    removeUnlicensedPdfs(path.join(root, "papers", slug, "dist"));
  }
  run([vite, "build", "--config", "collection/vite.config.js"]);
  for (const { slug } of papers) {
    const source = path.join(root, "papers", slug, "dist");
    if (!existsSync(path.join(source, "index.html"))) throw new Error(`Missing built homepage for ${slug}.`);
    cpSync(source, path.join(root, "dist", slug), { recursive: true });
  }
  const headers = path.join(root, "infra/cloudflare/_headers");
  if (existsSync(headers)) cpSync(headers, path.join(root, "dist/_headers"));
  console.log("[paper-observatory] Built the public library and all paper sites into dist/; source PDFs stay local.");
} catch (error) {
  console.error(`[paper-observatory] ${error.message}`);
  process.exitCode = 1;
}
