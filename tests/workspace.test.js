import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import collectionConfig from '../collection/vite.config.js';
import riskConfig from '../papers/risk-on-off/vite.config.js';
import flowConfig from '../papers/stochastic-flow-diagrams/vite.config.js';
import { getPaper } from '../shared/catalog.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = relative => readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const manifest = json('package.json');
const sites = [
  { slug: 'risk-on-off', name: 'risk-observatory', source: 'ssrn-2150877.pdf', hash: 'e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de', devPort: 5174, previewPort: 4174, config: riskConfig },
  { slug: 'stochastic-flow-diagrams', name: 'flow-observatory', source: 'ssrn-2379314.pdf', hash: '9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54', devPort: 5175, previewPort: 4175, config: flowConfig },
];
const digest = relative => createHash('sha256').update(readFileSync(path.join(root, relative))).digest('hex');
const actualPaperDirectories = () => readdirSync(path.join(root, 'papers'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
const scriptPort = command => Number(command.match(/--port(?:=|\s+)(\d+)/)?.[1]);

function publicEntries(directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(directory, entry.name);
    return [relative, ...(entry.isDirectory() ? publicEntries(relative) : [])];
  });
}

test('the private collection declares the paper workspace glob', () => {
  assert.equal(manifest.name, 'thepaperobservatory.com');
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, 'module');
  assert.ok(manifest.workspaces.includes('papers/*'));
});

test('both migrated papers are real workspaces with unique package identities', () => {
  const directories = actualPaperDirectories();
  for (const site of sites) assert.ok(directories.includes(site.slug), site.slug);
  const manifests = directories.map(slug => json(`papers/${slug}/package.json`));
  assert.equal(new Set(manifests.map(item => item.name)).size, manifests.length);
  for (const item of manifests) {
    assert.equal(item.private, true);
    assert.ok(typeof item.name === 'string' && item.name.trim());
    assert.ok(item.scripts.dev && item.scripts.build && item.scripts.test);
  }
  for (const site of sites) assert.equal(json(`papers/${site.slug}/package.json`).name, site.name);
});

test('root commands coordinate the collection and both workspaces', () => {
  assert.match(manifest.scripts.dev, /scripts\/serve\.mjs\s+dev/);
  assert.match(manifest.scripts.start, /scripts\/serve\.mjs\s+dev\s+--open/);
  assert.match(manifest.scripts.build, /scripts\/build\.mjs/);
  assert.match(manifest.scripts.test, /--workspaces/);
  for (const command of Object.values(manifest.scripts)) {
    const workspace = command.match(/--workspace\s+([^\s]+)/)?.[1];
    if (workspace) assert.ok(existsSync(path.join(root, workspace, 'package.json')), workspace);
  }
});

for (const site of sites) {
  test(`${site.slug}: source provenance is preserved locally and declared in public metadata`, () => {
    const original = `papers/${site.slug}/${site.source}`;
    const publicCopy = `papers/${site.slug}/public/paper.pdf`;
    assert.equal(getPaper(site.slug).sourceHash, site.hash);
    if (existsSync(path.join(root, original))) {
      assert.equal(readFileSync(path.join(root, original)).subarray(0, 5).toString(), '%PDF-');
      assert.equal(digest(original), site.hash);
      assert.equal(digest(publicCopy), site.hash);
    } else {
      assert.equal(existsSync(path.join(root, publicCopy)), false);
      assert.ok(read('.gitignore').split(/\r?\n/).includes('**/*.pdf'));
    }
    assert.equal(existsSync(path.join(root, site.source)), false);
  });

  test(`${site.slug}: its base URL, direct ports and collection proxy agree`, () => {
    const app = json(`papers/${site.slug}/package.json`);
    assert.equal(site.config.base, `/${site.slug}/`);
    assert.equal(scriptPort(app.scripts.dev), site.devPort);
    assert.equal(scriptPort(app.scripts.preview), site.previewPort);
    for (const command of [app.scripts.dev, app.scripts.preview]) {
      assert.match(command, /--host\s+127\.0\.0\.1/);
      assert.match(command, /--strictPort/);
    }
    const proxy = collectionConfig.server.proxy[`/${site.slug}`];
    assert.equal(proxy.target, `http://127.0.0.1:${site.devPort}`);
    assert.equal(proxy.ws, true);
  });
}

test('collection and direct application servers have distinct loopback ports', () => {
  assert.equal(collectionConfig.server.host, '127.0.0.1');
  assert.equal(collectionConfig.server.port, 5173);
  assert.equal(collectionConfig.preview.host, '127.0.0.1');
  assert.equal(collectionConfig.preview.port, 4173);
  assert.equal(collectionConfig.server.strictPort, true);
  assert.equal(collectionConfig.preview.strictPort, true);
  const ports = [5173, 4173, ...sites.flatMap(site => [site.devPort, site.previewPort])];
  assert.equal(new Set(ports).size, ports.length);
});

test('catalog paper links resolve to declared application subfolders', () => {
  const catalog = read('collection/index.html');
  const links = [...catalog.matchAll(/<a\b[^>]*\bhref="([^\"]+)"/g)].map(match => match[1]);
  for (const site of sites) assert.ok(links.includes(`/${site.slug}/`), site.slug);
  const supportRoutes = new Set(['learn', 'about', 'channels', 'privacy']);
  const paperLinks = links.filter(href => href.startsWith('/') && href.split('/')[1] && !href.startsWith('/#'));
  for (const href of paperLinks) {
    const slug = href.split('/')[1];
    if (supportRoutes.has(slug)) {
      assert.ok(existsSync(path.join(root, 'collection', slug, 'index.html')), href);
      continue;
    }
    assert.ok(actualPaperDirectories().includes(slug), href);
    assert.ok(existsSync(path.join(root, 'papers', slug, 'package.json')), href);
  }
});

test('first-paper source and tests no longer occupy collection root paths', () => {
  for (const relative of ['src', 'public', 'tests/math.test.js', 'tests/architecture.test.js']) {
    assert.equal(existsSync(path.join(root, relative)), false, relative);
  }
  for (const relative of ['src/App.jsx', 'tests/math.test.js', 'tests/architecture.test.js']) {
    assert.ok(existsSync(path.join(root, 'papers/risk-on-off', relative)), relative);
  }
});

test('shared status and private material remain outside both public asset roots', () => {
  assert.ok(existsSync(path.join(root, 'status/status_slide.py')));
  assert.ok(existsSync(path.join(root, 'status/README.md')));
  for (const site of sites) {
    for (const relative of publicEntries(`papers/${site.slug}/public`)) {
      assert.equal(lstatSync(path.join(root, relative)).isSymbolicLink(), false, relative);
      assert.doesNotMatch(relative, /(?:^|\/)(?:\.env(?:\..*)?|confidential|status|\.git|\.codex)(?:\/|$)/i);
      assert.doesNotMatch(relative, /\.(?:pem|key|sqlite3?|db)(?:$|-)/i);
    }
  }
});

test('workspace-wide ignores protect nested runtime and private directories', () => {
  const rules = read('.gitignore').split(/\r?\n/);
  for (const rule of ['node_modules/', 'dist/', '.venv/', 'confidential/', '.env', '.env.*', '!.env.example', 'status/*']) assert.ok(rules.includes(rule), rule);
  assert.ok(rules.indexOf('!.env.example') > rules.indexOf('.env.*'));
});
