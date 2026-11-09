import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { glossary, quiz, evidence, readingList, limitations } from '../src/data/content.js';
import { getPaper } from '../../../shared/catalog.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const workspace = fileURLToPath(new URL('../../../', import.meta.url));
const sharedPaths = new Set(['.gitignore', 'status/status_slide.py', '.codex/hooks.json', '.env.example']);
const read = name => readFileSync(path.join(sharedPaths.has(name) ? workspace : root, name), 'utf8');
const sourceHash = 'e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de';
const sourcePageCount = 50;
const hash = name => createHash('sha256').update(readFileSync(path.join(root, name))).digest('hex');
const text = value => assert.ok(typeof value === 'string' && value.trim().length > 0);
const page = value => assert.ok(Number.isInteger(value) && value >= 1 && value <= sourcePageCount, `Invalid source page: ${value}`);
const unique = values => assert.equal(new Set(values).size, values.length, 'Entries must be unique');

function walk(directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(directory, entry.name);
    return entry.isDirectory() ? walk(relative) : [relative];
  });
}

const browserInputs = () => ['index.html', ...walk('src').filter(name => /\.(?:[cm]?js|jsx|css|html|svg)$/.test(name))];

test('original source hash is recorded and locally present source is unchanged', () => {
  assert.equal(getPaper('risk-on-off').sourceHash, sourceHash);
  assert.equal(getPaper('risk-on-off').sourcePages, sourcePageCount);
  if (existsSync(path.join(root, 'ssrn-2150877.pdf'))) {
    assert.equal(readFileSync(path.join(root, 'ssrn-2150877.pdf')).subarray(0, 5).toString(), '%PDF-');
    assert.equal(hash('ssrn-2150877.pdf'), sourceHash);
  } else assert.ok(read('.gitignore').includes('**/*.pdf'));
});

test('local PDF reading copy matches the original or is excluded from the public checkout', () => {
  if (existsSync(path.join(root, 'ssrn-2150877.pdf'))) {
    assert.equal(hash('public/paper.pdf'), sourceHash);
    assert.equal(hash('public/paper.pdf'), hash('ssrn-2150877.pdf'));
  } else assert.equal(existsSync(path.join(root, 'public/paper.pdf')), false);
});

test('public assets contain no secret, private, database, or status files', () => {
  for (const name of walk('public')) {
    assert.doesNotMatch(name, /(?:^|\/)(?:\.env(?:\..*)?|confidential|\.git|\.codex|status|node_modules)(?:\/|$)/i);
    assert.doesNotMatch(name, /\.(?:pem|key|sqlite3?|db)(?:$|-)/i);
  }
});

test('public assets cannot follow symlinks outside their publication boundary', () => {
  for (const name of walk('public')) assert.equal(lstatSync(path.join(root, name)).isSymbolicLink(), false, name);
});

test('browser inputs do not import private material or expose workstation paths', () => {
  for (const name of browserInputs()) {
    const source = read(name);
    assert.doesNotMatch(source, /(?:from\s*|import\s*\(|import\s*|require\s*\()\s*['"][^'"\n]*(?:confidential|\.env(?:['"./]|$)|status\/)/i, name);
    assert.doesNotMatch(source, /(?:\/Users\/|\/home\/)[^\s'"<>]+/, name);
  }
});

test('scripts, styles, and images are local runtime assets', () => {
  for (const name of browserInputs()) {
    const source = read(name);
    assert.doesNotMatch(source, /(?:src\s*=\s*['"]|url\(\s*['"]?|@import\s+['"]|(?:import|export)[^\n;]*\bfrom\s*['"]|import\s*['"]|import\(\s*['"])(?:https?:)?\/\//i, name);
    if (/\.html$/.test(name)) {
      for (const tag of source.matchAll(/<link\b[^>]*>/gi)) {
        if (/\brel\s*=\s*['"](?:stylesheet|preload|modulepreload|icon|preconnect|dns-prefetch)['"]/i.test(tag[0])) {
          assert.doesNotMatch(tag[0], /\bhref\s*=\s*['"](?:https?:)?\/\//i, name);
        }
      }
    }
  }
});

test('local educational exhibits have no runtime data-service dependency', () => {
  for (const name of browserInputs()) {
    if (/\.[cm]?jsx?$/.test(name)) assert.doesNotMatch(read(name), /\b(?:fetch|WebSocket|XMLHttpRequest|EventSource)\s*\(/, name);
  }
});

test('privacy ignore rules retain only the environment example', () => {
  const rules = read('.gitignore').split(/\r?\n/);
  for (const rule of ['confidential/', '.env', '.env.*', '!.env.example', '.venv/']) assert.ok(rules.includes(rule), rule);
  assert.ok(rules.indexOf('!.env.example') > rules.indexOf('.env.*'));
});

test('dependencies, built files, and generated status stay untracked', () => {
  const rules = read('.gitignore').split(/\r?\n/);
  for (const rule of ['node_modules/', 'dist/', 'status/*', '!status/README.md', '!status/status_slide.py']) assert.ok(rules.includes(rule), rule);
  assert.ok(rules.indexOf('!status/status_slide.py') > rules.indexOf('status/*'));
});

test('status output paths remain inside the root status subsystem', () => {
  const source = read('status/status_slide.py');
  assert.match(source, /STATUS_DIR\s*=\s*PROJECT_ROOT\s*\/\s*["']status["']/);
  for (const constant of ['STATUS_TEX', 'STATUS_PDF', 'STATUS_STATE']) assert.match(source, new RegExp(`${constant}\\s*=\\s*STATUS_DIR\\s*\\/`));
  for (const name of browserInputs()) assert.doesNotMatch(read(name), /(?:src|href)\s*=\s*['"]\/?status\//, name);
});

test('status hooks parse as JSON, work before Git setup, and disable notifications', () => {
  const hooks = JSON.parse(read('.codex/hooks.json')).hooks;
  for (const [event, action] of [['UserPromptSubmit', 'hook-start'], ['Stop', 'hook-finish']]) {
    const commands = hooks[event].flatMap(group => group.hooks).map(hook => hook.command);
    assert.ok(commands.some(command => command.includes(`python3 status/status_slide.py ${action}`)));
    commands.forEach(command => {
      assert.match(command, /STATUS_TELEGRAM_ENABLED=false/);
      assert.doesNotMatch(command, /git rev-parse/);
    });
  }
});

test('local example configuration requires no credentials or external notifications', () => {
  const entries = read('.env.example').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  assert.ok(entries.includes('STATUS_TELEGRAM_ENABLED=false'));
  for (const entry of entries) {
    if (/^(?:OPENAI_API_KEY|CLOUDFLARE_API_TOKEN|VITE_ADSENSE_PUBLISHER_ID|VITE_ADSENSE_SLOT_ID)=/.test(entry)) assert.equal(entry.split('=').slice(1).join('='), '');
  }
  assert.match(read('status/status_slide.py'), /os\.environ\.get\("STATUS_TELEGRAM_ENABLED", "false"\)/);
});

test('project scripts provide local preview, native tests, and a static build', () => {
  const manifest = JSON.parse(read('package.json'));
  assert.equal(manifest.private, true);
  assert.match(manifest.scripts.dev, /--host 127\.0\.0\.1/);
  assert.match(manifest.scripts.preview, /--host 127\.0\.0\.1/);
  assert.equal(manifest.scripts.build, 'vite build');
  assert.match(manifest.scripts.test, /node --test/);
});

test('glossary has unique terms and complete undergraduate and graduate explanations', () => {
  assert.ok(glossary.length > 0);
  unique(glossary.map(entry => entry.term));
  glossary.forEach(entry => ['term', 'definition', 'advanced'].forEach(key => text(entry[key])));
});

test('quiz choices, correct indices, feedback, and source references form valid questions', () => {
  assert.ok(quiz.length > 0);
  unique(quiz.map(entry => entry.id));
  for (const entry of quiz) {
    ['id', 'question', 'explanation'].forEach(key => text(entry[key]));
    assert.ok(Array.isArray(entry.options) && entry.options.length >= 2);
    entry.options.forEach(text);
    unique(entry.options);
    assert.ok(Number.isInteger(entry.correct) && entry.correct >= 0 && entry.correct < entry.options.length);
    page(entry.source);
  }
});

test('paper evidence entries have complete attribution within the 50-page source', () => {
  assert.ok(evidence.length > 0);
  unique(evidence.map(entry => entry.title));
  for (const entry of evidence) {
    ['title', 'summary', 'detail'].forEach(key => text(entry[key]));
    page(entry.slide);
  }
});

test('further reading uses explicit HTTPS scholarly links and author attribution', () => {
  assert.ok(readingList.length > 0);
  unique(readingList.map(entry => entry.url));
  for (const entry of readingList) {
    ['title', 'author', 'note'].forEach(key => text(entry[key]));
    const url = new URL(entry.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.username, '');
    assert.equal(url.password, '');
  }
});

test('model limitations have unique readable titles and explanatory text', () => {
  assert.ok(limitations.length > 0);
  unique(limitations.map(entry => entry.title));
  limitations.forEach(entry => ['title', 'text'].forEach(key => text(entry[key])));
});
