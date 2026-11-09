import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { papers, getPaper, sourceUrl } from '../shared/catalog.js';
import { site, courses, campaignUrl } from '../shared/site-config.js';
import { advertisingConfig, consentAllowsAds } from '../shared/advertising.js';
import { socialPack } from '../scripts/social-packs.mjs';
import { localSourcePlugin } from '../shared/vite-source.js';

const validAd = { VITE_ADSENSE_ENABLED:'true', VITE_ADSENSE_PUBLISHER_ID:'ca-pub-1234567890123456', VITE_ADSENSE_SLOT_ID:'1234567890', VITE_GOOGLE_CMP_READY:'true' };
const consent = { cmpStatus:'loaded', eventStatus:'useractioncomplete', gdprApplies:true, purpose:{consents:{1:true}}, vendor:{consents:{755:true}} };

test('the site identity pins cloud design without claiming a fallback model', () => {
  assert.equal(site.domain, 'thepaperobservatory.com');
  assert.equal(site.origin, `https://${site.domain}`);
  assert.deepEqual(site.initialDesign, {model:'gpt-6.1-sol',reasoning:'ultra',execution:'cloud',fallback:'none'});
  assert.equal(new URL(site.repository).hostname, 'github.com');
});
test('catalog identifiers, namespaces and ports cannot collide', () => {
  for (const key of ['slug','ssrnId','devPort','previewPort']) assert.equal(new Set(papers.map(p => p[key])).size, papers.length, key);
  for (const paper of papers) {
    assert.match(paper.slug,/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
    assert.match(paper.sourceHash,/^[a-f0-9]{64}$/);
    assert.ok(!['learn','channels','privacy','about','assets'].includes(paper.slug));
    assert.ok(paper.sourcePages > 0 && paper.labs > 0);
  }
});
test('public source links point to the exact SSRN record without redistributing PDFs', () => {
  for (const paper of papers) {
    const url = new URL(sourceUrl(paper.slug, paper.sourcePages));
    assert.equal(url.hostname,'papers.ssrn.com');
    assert.equal(url.searchParams.get('abstract_id'),paper.ssrnId);
    assert.ok(!url.pathname.endsWith('.pdf'));
  }
});
test('local reading links retain physical PDF page numbers', () => {
  assert.equal(sourceUrl('stochastic-flow-diagrams',14,{local:true}),'/stochastic-flow-diagrams/paper.pdf#page=14');
  assert.equal(sourceUrl('risk-on-off',undefined,{local:true}),'/risk-on-off/paper.pdf');
});
test('unknown papers and invalid source pages fail clearly', () => {
  assert.throws(()=>getPaper('missing'),/Unknown paper/);
  for (const page of [0,-1,51,1.5,NaN]) assert.throws(()=>sourceUrl('risk-on-off',page),/Invalid physical/);
});
test('course links use the publisher domain and preserve commercial campaign attribution', () => {
  for (const course of courses) {
    const url=new URL(campaignUrl(course.url,{campaign:'risk-on-off',content:'footer'}));
    assert.equal(url.protocol,'https:');
    assert.equal(url.hostname,'tglauner.com');
    assert.equal(url.searchParams.get('utm_campaign'),'risk-on-off');
    assert.equal(url.searchParams.get('utm_content'),'footer');
    assert.equal(url.username,'');
  }
  assert.throws(()=>campaignUrl('http://example.com'),/HTTPS/);
});
test('advertising stays inactive unless explicitly enabled with valid account and CMP settings', () => {
  for (const enabled of [undefined,'false','1','yes','TRUE']) assert.equal(advertisingConfig({VITE_ADSENSE_ENABLED:enabled}).enabled,false);
  assert.equal(advertisingConfig(validAd).enabled,true);
  for (const key of ['VITE_ADSENSE_PUBLISHER_ID','VITE_ADSENSE_SLOT_ID','VITE_GOOGLE_CMP_READY']) assert.throws(()=>advertisingConfig({...validAd,[key]:''}),/Ads require/);
});
test('unavailable, loading and denied consent never permits an ad request', () => {
  assert.equal(consentAllowsAds(undefined,false),false);
  assert.equal(consentAllowsAds(consent,false),false);
  assert.equal(consentAllowsAds({...consent,cmpStatus:'loading'},true),false);
  assert.equal(consentAllowsAds({...consent,eventStatus:'cmpuishown'},true),false);
  assert.equal(consentAllowsAds({...consent,gdprApplies:undefined},true),false);
  assert.equal(consentAllowsAds({...consent,purpose:{consents:{1:false}}},true),false);
  assert.equal(consentAllowsAds({...consent,vendor:{consents:{755:false}}},true),false);
});
test('an explicit applicable consent or CMP-declared out-of-scope region passes the additional startup gate', () => {
  assert.equal(consentAllowsAds(consent,true),true);
  assert.equal(consentAllowsAds({...consent,gdprApplies:false,purpose:undefined,vendor:undefined},true),true);
});
test('social packs are deterministic source-attributed drafts with channel-specific destination links', () => {
  for (const paper of papers) {
    const pack=socialPack(paper);
    assert.deepEqual(pack,socialPack(paper));
    assert.equal(pack.source_hash,paper.sourceHash);
    assert.equal(pack.source_doc_ref,`SSRN:${paper.ssrnId}`);
    assert.equal(pack.status,'draft');
    assert.match(pack.asset_id,/^social-\d+-[a-f0-9]{12}$/);
    for (const [channel,item] of Object.entries(pack.channels)) {
      const url=new URL(item.url);
      assert.equal(url.origin,site.origin);
      assert.equal(url.pathname,`/${paper.slug}/`);
      assert.equal(url.searchParams.get('utm_source'),channel);
      assert.ok(item.caption && item.cta);
    }
    for(const shot of pack.shots) assert.match(shot.view,/^#[a-z-]+$/);
  }
});
test('source papers and transient cloud inputs are excluded from the public repository', () => {
  const ignore=readFileSync(new URL('../.gitignore',import.meta.url),'utf8');
  for(const rule of ['**/*.pdf','.cloud-input/','.wrangler/']) assert.ok(ignore.split(/\r?\n/).includes(rule));
  assert.ok(existsSync(new URL('../.agents/skills/design-ssrn-paper/SKILL.md',import.meta.url)));
});

test('public builds and cloud checkouts cannot link a missing local reading copy', () => {
  const local = new URL('../papers/risk-on-off/vite.config.js', import.meta.url);
  const missing = new URL('../missing-source/vite.config.js', import.meta.url);
  const defineFor = (url, command) => localSourcePlugin(url).config({}, {command}).define['import.meta.env.LOCAL_SOURCE_AVAILABLE'];
  assert.equal(defineFor(local, 'build'), 'false');
  assert.equal(defineFor(missing, 'serve'), 'false');
  assert.equal(defineFor(local, 'serve'), String(existsSync(new URL('public/paper.pdf', local))));
});
