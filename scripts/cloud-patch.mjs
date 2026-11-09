import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function git(args, input) {
  const result = spawnSync('git', args, { encoding: 'utf8', input, maxBuffer: 30 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`Git ${args[0]} failed; the generated patch was not accepted.`);
  return result.stdout;
}
export function permittedPath(name, slug) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug || '')) return false;
  if (name.includes('..') || name.includes('\\') || /[\r\n\t]/.test(name)) return false;
  if (/(?:^|\/)(?:\.git(?:hub)?|\.codex|\.agents|AGENTS\.md|MEMORY\.md|\.npmrc|\.pypirc|\.gitmodules)(?:\/|$)/i.test(name)) return false;
  if (/\.(pdf|pem|key|db|sqlite|map)$/i.test(name) || /(?:^|\/)(?:\.env[^/]*|source\.txt|confidential|node_modules|dist|output|\.cloud-input)(?:\/|$)/i.test(name)) return false;
  if (name.startsWith(`papers/${slug}/`)) return true;
  if (name.startsWith(`content/social/${slug}/`)) return true;
  return ['shared/catalog.js', 'collection/index.html', 'collection/style.css', 'collection/app.js', 'package.json', 'package-lock.json'].includes(name);
}
async function collect(slug) {
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  for (const name of untracked) {
    if (permittedPath(name, slug)) git(['add', '--intent-to-add', '--', name]);
    else if (!name.startsWith('.cloud-input/')) throw new Error(`Generation produced an unapproved new path: ${name}`);
  }
  const names = git(['diff', '--name-only', '-z', 'HEAD']).split('\0').filter(Boolean);
  if (!names.length) throw new Error('The agent produced no reviewable source changes.');
  for (const name of names) if (!permittedPath(name, slug)) throw new Error(`Generation changed an unapproved path: ${name}`);
  const patch = git(['diff', '--binary', '--no-renames', 'HEAD']);
  if (/^(?:new file mode|old mode|new mode) 120000$/m.test(patch)) throw new Error('Generated symlinks are not accepted.');
  await mkdir('.cloud-input/review', { recursive: true });
  await writeFile('.cloud-input/review/generated.patch', patch);
  const provenance = JSON.parse(await readFile('.cloud-input/provenance.json', 'utf8'));
  await writeFile('.cloud-input/review/provenance.json', JSON.stringify({ ...provenance, changed_paths: names }, null, 2) + '\n');
  console.log(`[cloud-generation] Collected ${names.length} approved paths for a separate validation job.`);
}
async function check(file, slug) {
  const patch = await readFile(file, 'utf8');
  if (/^(?:new file mode|old mode|new mode) 120000$/m.test(patch)) throw new Error('Generated symlinks are not accepted.');
  const entries = git(['apply', '--numstat', '-z', '--'], patch).split('\0').filter(Boolean);
  if (!entries.length) throw new Error('The generated patch is empty.');
  for (const entry of entries) {
    const match = /^(?:\d+|-)\t(?:\d+|-)\t(.+)$/.exec(entry);
    if (!match || !permittedPath(match[1], slug)) throw new Error('The patch includes an unapproved, renamed or private path.');
  }
  git(['apply', '--check', '--index', '--'], patch);
  console.log(`[cloud-generation] Patch path and applicability checks passed (${entries.length} files).`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'collect') await collect(process.env.PAPER_SLUG);
    else if (process.argv[2] === 'check') await check(process.argv[3], process.env.PAPER_SLUG);
    else throw new Error('Usage: PAPER_SLUG=<slug> node scripts/cloud-patch.mjs collect|check <patch-file>');
  } catch (error) {
    console.error(`[cloud-generation] ${error.message}`);
    process.exitCode = 1;
  }
}
