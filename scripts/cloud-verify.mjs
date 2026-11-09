import { lstat, readdir, readFile } from 'node:fs/promises';
import { resolve, relative, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const forbiddenNames = new Set(['.git', '.github', '.codex', '.agents', 'confidential', 'node_modules', 'src', 'tests', 'status', 'package.json', 'package-lock.json', 'AGENTS.md', 'MEMORY.md', '_worker.js', 'functions']);
const forbiddenExtensions = new Set(['.pdf', '.map', '.py', '.pem', '.key', '.sqlite', '.db', '.tex', '.docx']);
export function verifyFreePlanFileCount(count) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 20_000) throw new Error('Cloudflare Pages Free requires between 1 and 20,000 static files.');
}
export function publicPathProblem(name, isLink = false) {
  if (isLink) return 'symlinks are not public artifacts';
  if (forbiddenNames.has(name) || /^\.env(?:\.|$)/i.test(name)) return 'private or source path';
  if (forbiddenExtensions.has(extname(name).toLowerCase())) return 'restricted source or credential artifact';
  return null;
}
export async function verifyPublicArtifact(directory = 'dist') {
  const root = resolve(directory);
  let count = 0;
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      const problem = publicPathProblem(entry.name, entry.isSymbolicLink());
      if (problem) throw new Error(`${relative(root, full)}: ${problem}`);
      if (entry.isDirectory()) await walk(full);
      else {
        const stat = await lstat(full);
        if (!stat.isFile()) throw new Error(`Unsupported artifact type: ${relative(root, full)}`);
        if (stat.size > 25 * 1024 * 1024) throw new Error(`Cloudflare Pages asset exceeds 25 MiB: ${relative(root, full)}`);
        const signature = (await readFile(full)).subarray(0, 4096).toString('utf8');
        if (/^\s*%PDF-/.test(signature) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(signature)) throw new Error(`Restricted document or credential content: ${relative(root, full)}`);
        count += 1;
      }
    }
  }
  await walk(root);
  verifyFreePlanFileCount(count);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  if (!/<html[\s>]/i.test(html) || !/<main[\s>]/i.test(html)) throw new Error('The public artifact needs a complete library homepage.');
  if (/(?:src|href)=["'][^"']*(?:@vite|\/src\/|node_modules)/.test(html)) throw new Error('The homepage references development assets.');
  return { files: count, directory: root };
}
function selfTest() {
  assert.equal(publicPathProblem('index.html'), null);
  assert.equal(publicPathProblem('chart-Ab12.js'), null);
  assert.ok(publicPathProblem('.env.production'));
  assert.ok(publicPathProblem('confidential'));
  assert.ok(publicPathProblem('paper.pdf'));
  assert.ok(publicPathProblem('secret.key'));
  assert.ok(publicPathProblem('index.html', true));
  assert.ok(publicPathProblem('index.js.map'));
  assert.ok(publicPathProblem('_worker.js'));
  assert.ok(publicPathProblem('functions'));
  assert.doesNotThrow(() => verifyFreePlanFileCount(20_000));
  assert.throws(() => verifyFreePlanFileCount(20_001));
  assert.throws(() => verifyFreePlanFileCount(0));
  console.log('[cloud-publication] 13 publication-boundary and free-plan checks passed.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.includes('--self-test')) selfTest();
    else {
      const result = await verifyPublicArtifact(process.argv[2] || 'dist');
      console.log(`[cloud-publication] Verified ${result.files} static files; no PDFs, private paths, source trees or symlinks.`);
    }
  } catch (error) {
    console.error(`[cloud-publication] ${error.message}`);
    process.exitCode = 1;
  }
}
