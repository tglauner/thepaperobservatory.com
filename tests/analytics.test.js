import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { analyticsSettings, analyticsTags, analyticsScript } from '../shared/analytics.js';

for (const value of ['0', 'false', 'no', 'off', ' FALSE ']) {
  test(`analytics disabled with ${value} renders no configuration or tracker`, () => {
    assert.deepEqual(analyticsTags(analyticsSettings({ ANALYTICS_ENABLED: value }, 'build')), []);
  });
}
test('development and production choose different collectors with a stable site identifier', () => {
  assert.equal(analyticsSettings().collector, 'http://127.0.0.1:9000/collect');
  assert.equal(analyticsSettings({}, 'build').collector, 'https://tglauner.com/collect');
  assert.equal(analyticsSettings().appId, 'paper-observatory');
  assert.equal(analyticsSettings().script, analyticsScript);
});
test('public overrides are explicit and invalid boolean, app ID and unsafe URLs fail clearly', () => {
  const settings = analyticsSettings({ ANALYTICS_APP_ID: 'test-site', ANALYTICS_COLLECTOR_URL: 'http://127.0.0.1:19000/collect', ANALYTICS_SCRIPT_URL: 'https://example.com/tracking.js' });
  assert.equal(settings.appId, 'test-site');
  assert.equal(settings.collector, 'http://127.0.0.1:19000/collect');
  assert.equal(settings.script, 'https://example.com/tracking.js');
  for (const env of [{ ANALYTICS_ENABLED: 'maybe' }, { ANALYTICS_APP_ID: '</script>' }, { ANALYTICS_SCRIPT_URL: 'javascript:alert(1)' }, { ANALYTICS_COLLECTOR_URL: 'http://example.com/collect' }, { ANALYTICS_COLLECTOR_URL: 'https://secret@example.com/collect' }]) assert.throws(() => analyticsSettings(env));
});
test('configuration precedes the single shared tracker, and injected values cannot end the script', () => {
  const settings = analyticsSettings({ ANALYTICS_COLLECTOR_URL: 'https://example.com/collect?x=</script>' });
  const tags = analyticsTags(settings);
  assert.equal(tags.length, 2);
  assert.equal(tags[1].attrs.src, analyticsScript);
  assert.equal(tags[1].attrs.defer, true);
  assert.doesNotMatch(tags[0].children, /<\/script/i);
  const context = { window: {} };
  vm.runInNewContext(tags[0].children, context);
  assert.equal(context.window.tgAnalyticsConfig.appId, 'paper-observatory');
  assert.equal(context.window.tgAnalyticsConfig.collector, settings.collector);
});
test('all independent HTML entry points share one integration, including the not-found page', async () => {
  for (const config of ['collection/vite.config.js', 'papers/risk-on-off/vite.config.js', 'papers/stochastic-flow-diagrams/vite.config.js']) {
    const source = await readFile(config, 'utf8');
    assert.equal(source.match(/analyticsPlugin\(\)/g)?.length, 1, config);
  }
  assert.match(await readFile('collection/vite.config.js', 'utf8'), /"404.html"/);
});
