import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('../', import.meta.url));
export const analyticsScript = 'https://tglauner.com/visitor_analytics/tracking/tracking.js';

export function analyticsSettings(environment = {}, command = 'serve') {
  const enabled = String(environment.ANALYTICS_ENABLED ?? 'true').trim().toLowerCase();
  if (!['true', '1', 'yes', 'on', 'false', '0', 'no', 'off'].includes(enabled)) {
    throw new Error('ANALYTICS_ENABLED must be a boolean.');
  }
  if (['false', '0', 'no', 'off'].includes(enabled)) return null;
  const appId = environment.ANALYTICS_APP_ID || 'paper-observatory';
  if (!/^[a-z][a-z0-9_-]{0,63}$/.test(appId)) throw new Error('ANALYTICS_APP_ID must be a lowercase site identifier.');
  function endpoint(value, name) {
    const url = new URL(value);
    if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
      throw new Error(`${name} must use HTTPS or local loopback HTTP, without credentials.`);
    }
    return url.href;
  }
  return {
    appId,
    collector: endpoint(environment.ANALYTICS_COLLECTOR_URL || (command === 'serve' ? 'http://127.0.0.1:9000/collect' : 'https://tglauner.com/collect'), 'ANALYTICS_COLLECTOR_URL'),
    script: endpoint(environment.ANALYTICS_SCRIPT_URL || analyticsScript, 'ANALYTICS_SCRIPT_URL'),
  };
}

export function analyticsTags(settings) {
  if (!settings) return [];
  // JSON encoding plus '<' escaping prevents configuration from ending the script tag.
  const config = JSON.stringify({ collector: settings.collector, appId: settings.appId }).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return [
    { tag: 'script', attrs: { id: 'tg-analytics-config' }, children: `window.tgAnalyticsConfig = ${config};`, injectTo: 'body' },
    { tag: 'script', attrs: { id: 'tg-analytics-script', src: settings.script, defer: true }, injectTo: 'body' },
  ];
}

export function analyticsPlugin() {
  let settings;
  return {
    name: 'tgir-visitor-analytics',
    config(_config, { mode, command }) {
      settings = analyticsSettings({ ...loadEnv(mode, workspace, 'ANALYTICS_'), ...Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('ANALYTICS_'))) }, command);
    },
    transformIndexHtml: { order: 'post', handler: () => analyticsTags(settings) },
  };
}
