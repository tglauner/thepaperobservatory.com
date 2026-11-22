(() => {
  const key = 'observatory.analytics-consent.v1';
  const panel = document.createElement('section');
  panel.setAttribute('aria-label', 'Analytics cookies');
  panel.style.cssText = 'position:fixed;bottom:1rem;left:1rem;z-index:2147483646;max-width:min(29rem,calc(100% - 2rem));box-sizing:border-box;padding:1rem;background:#fff;color:#172e29;border:1px solid #758b84;border-radius:.5rem;box-shadow:0 3px 20px #0003;font:1rem/1.45 system-ui;text-align:left';
  const info = document.createElement('p');
  info.style.cssText = 'margin:0 0 .75rem;color:inherit;font:inherit';
  info.textContent = 'May we use analytics cookies to understand visits and see how people use this site with Microsoft Clarity?';
  panel.append(info);

  function button(label, action) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.style.cssText = 'background:#fff;color:#193e34;border:1px solid #58756a;border-radius:.3rem;padding:.45rem .7rem;margin:.15rem;font:500 .9rem/1.4 system-ui;cursor:pointer';
    element.addEventListener('click', action);
    return element;
  }
  const accept = button('Accept analytics', () => choose('granted'));
  const decline = button('Essential only', () => choose('denied'));
  panel.append(accept, decline);
  document.body.append(panel);
  const settings = button('Cookie preferences', () => {
    panel.hidden = false;
    (window.tgAnalyticsConsent ? accept : decline).focus();
  });
  document.body.append(settings);

  function readChoice() {
    try { return localStorage.getItem(key); }
    catch { return null; }
  }
  function apply(choice) {
    panel.hidden = choice === 'granted' || choice === 'denied';
    const analytics = choice === 'granted' && navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true;
    window.tgAnalyticsConsent = analytics;
    window.dispatchEvent(new CustomEvent('tg:analytics-consent', { detail: { analytics } }));
  }
  function choose(choice) {
    try { localStorage.setItem(key, choice); }
    catch { /* Keep the choice for this page when storage is unavailable. */ }
    settings.focus({ preventScroll: true });
    apply(choice);
  }
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(readChoice());
  });
  apply(readChoice());
})();
