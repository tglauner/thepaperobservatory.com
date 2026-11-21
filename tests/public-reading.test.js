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

test('hjm: reading guide remains available without JavaScript and explains its limits', () => {
  const html = readFileSync(new URL('../papers/hjm/index.html', import.meta.url), 'utf8');
  const guide = html.match(/<section aria-labelledby="hjm-reading-guide"[\s\S]*?<\/section>/)?.[0];
  assert.ok(guide, 'static reading guide is present');
  assert.match(html, /<link rel="canonical" href="https:\/\/thepaperobservatory\.com\/hjm\/"\s*\/>/);
  assert.match(html, /<div id="root"><\/div>\s*<section aria-labelledby="hjm-reading-guide"/);
  assert.doesNotMatch(guide, /<noscript|hidden|display:\s*none|<script/i);
  assert.match(guide, /risk-neutral measure/i);
  assert.match(guide, /not a market calibration, a forecast/i);
  assert.match(guide, /https:\/\/ideas\.repec\.org\/a\/ecm\/emetrp\/v60y1992i1p77-105\.html/);
  assert.match(guide, /href="\/learn\/"/);
  assert.doesNotMatch(guide, /\.pdf(?:["?#]|$)/i);
});
