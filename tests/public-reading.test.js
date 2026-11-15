import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
for (const [slug, source, topic] of [['risk-on-off','2150877','component'],['stochastic-flow-diagrams','2379314','lag']]) {
  test(`${slug}: public reading guide works without JavaScript`, () => {
    const html=readFileSync(new URL(`../papers/${slug}/index.html`,import.meta.url),'utf8');
    assert.match(html, /<section class="public-reading" aria-labelledby=/);
    assert.ok(html.includes(`https://ssrn.com/abstract=${source}`));
    assert.ok(html.includes(topic));
    const guide=html.match(/<section class="public-reading"[\s\S]*?<\/section>/)[0];
    assert.ok(guide.split(/\s+/).length>250);
    assert.doesNotMatch(guide, /<noscript|hidden|display:\s*none|<script/);
    assert.ok(guide.includes('href="/"'));
  });
}
