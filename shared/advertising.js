export function advertisingConfig(env = {}) {
  const enabled = env.VITE_ADSENSE_ENABLED === "true";
  const publisher = env.VITE_ADSENSE_PUBLISHER_ID ?? "";
  const slot = env.VITE_ADSENSE_SLOT_ID ?? "";
  const cmpReady = env.VITE_GOOGLE_CMP_READY === "true";
  if (!enabled) return { enabled: false };
  if (!/^ca-pub-\d{16}$/.test(publisher) || !/^\d{10}$/.test(slot) || !cmpReady) {
    throw new Error("Ads require a valid publisher, slot and verified Google-certified CMP configuration.");
  }
  return { enabled, publisher, slot };
}

export function consentAllowsAds(data, success) {
  if (!success || data?.cmpStatus !== "loaded" || !["tcloaded", "useractioncomplete"].includes(data.eventStatus)) return false;
  if (data.gdprApplies === false) return true;
  return data.gdprApplies === true && data.purpose?.consents?.[1] === true && data.vendor?.consents?.[755] === true;
}

// The publisher's certified CMP supplies TCF data. Google evaluates the full
// signal itself; this gate additionally prevents an ad request before consent.
export function mountAdvertisement(container, config, win = window) {
  if (!config.enabled || typeof win.__tcfapi !== "function") return () => {};
  let disposed = false;
  let listenerId;
  const onConsent = (data, success) => {
    listenerId = data?.listenerId ?? listenerId;
    if (disposed) return;
    if (!consentAllowsAds(data, success)) {
      container.hidden = true;
      container.replaceChildren();
      return;
    }
    if (container.querySelector("ins")) return;
    const label = win.document.createElement("p");
    label.textContent = "Advertisements";
    const ad = win.document.createElement("ins");
    ad.className = "adsbygoogle";
    ad.style.display = "block";
    ad.dataset.adClient = config.publisher;
    ad.dataset.adSlot = config.slot;
    ad.dataset.adFormat = "auto";
    ad.dataset.fullWidthResponsive = "true";
    container.replaceChildren(label, ad);
    container.hidden = false;
    const request = () => {
      if (!disposed && ad.isConnected) (win.adsbygoogle = win.adsbygoogle || []).push({});
    };
    let script = win.document.getElementById("observatory-adsense");
    if (!script) {
      script = win.document.createElement("script");
      script.id = "observatory-adsense";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.publisher}`;
      script.addEventListener("load", () => { script.dataset.ready = "true"; request(); }, { once: true });
      script.addEventListener("error", () => { container.hidden = true; }, { once: true });
      win.document.head.append(script);
    } else if (script.dataset.ready === "true") request();
    else script.addEventListener("load", request, { once: true });
  };
  win.__tcfapi("addEventListener", 2, onConsent);
  return () => {
    disposed = true;
    container.hidden = true;
    container.replaceChildren();
    if (listenerId !== undefined) win.__tcfapi("removeEventListener", 2, () => {}, listenerId);
  };
}
