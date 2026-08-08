/**
 * Consent-gated loading of third-party measurement tags.
 *
 * Nothing here loads anything until two conditions hold: the visitor granted
 * the relevant category, AND the corresponding measurement ID is configured.
 * No IDs are hardcoded — they come from build-time environment variables, so
 * this file is inert until they are supplied.
 *
 * Events fired before consent are queued rather than dropped, so a visitor who
 * accepts after browsing does not lose the actions that led up to it.
 */

import { normalizeCategories } from "./consent";

const TAGS = Object.freeze({
  ga4: { category: "analytics", id: import.meta.env.VITE_GA4_MEASUREMENT_ID },
  meta: { category: "marketing", id: import.meta.env.VITE_META_PIXEL_ID },
  tiktok: { category: "marketing", id: import.meta.env.VITE_TIKTOK_PIXEL_ID },
});

const loaded = new Set();
let queue = [];
let currentCategories = normalizeCategories(null);

const trimmedId = (value) => {
  const id = `${value ?? ""}`.trim();
  return id || null;
};

const gtag = (...args) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
};

const injectScript = (src, attributes = {}) => {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  Object.entries(attributes).forEach(([name, value]) => script.setAttribute(name, value));
  document.head.appendChild(script);
  return script;
};

const loadGa4 = (id) => {
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  gtag("js", new Date());
  // The banner already governs storage, so GA4 does not need its own signal.
  gtag("config", id, { anonymize_ip: true });
};

const loadMeta = (id) => {
  // Meta's official snippet, kept verbatim so it stays diffable against their docs.
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", id);
  window.fbq("track", "PageView");
};

const loadTikTok = (id) => {
  // TikTok's official snippet, kept verbatim so it stays diffable against their docs.
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    const ttq = w[t] = w[t] || [];
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
    ttq.setAndDefer = function (obj, method) {
      obj[method] = function () { obj.push([method].concat(Array.prototype.slice.call(arguments, 0))); };
    };
    for (let i = 0; i < ttq.methods.length; i += 1) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (key) {
      const instance = ttq._i[key] || [];
      for (let i = 0; i < ttq.methods.length; i += 1) ttq.setAndDefer(instance, ttq.methods[i]);
      return instance;
    };
    ttq.load = function (key, options) {
      const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {}; ttq._i[key] = []; ttq._i[key]._u = url;
      ttq._t = ttq._t || {}; ttq._t[key] = +new Date();
      ttq._o = ttq._o || {}; ttq._o[key] = options || {};
      const script = d.createElement("script");
      script.type = "text/javascript"; script.async = !0; script.src = `${url}?sdkid=${key}&lib=${t}`;
      const first = d.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(script, first);
    };
    ttq.load(id);
    ttq.page();
  }(window, document, "ttq");
};

const LOADERS = { ga4: loadGa4, meta: loadMeta, tiktok: loadTikTok };

/**
 * Google Consent Mode v2. The denied defaults are set by the inline snippet in
 * index.html before anything loads; this only sends updates as the visitor
 * changes their mind.
 */
const updateConsentMode = (categories) => {
  gtag("consent", "update", {
    ad_storage: categories.marketing ? "granted" : "denied",
    ad_user_data: categories.marketing ? "granted" : "denied",
    ad_personalization: categories.marketing ? "granted" : "denied",
    analytics_storage: categories.analytics ? "granted" : "denied",
  });
};

const dispatch = (event, payload) => {
  if (currentCategories.analytics && window.gtag) {
    window.gtag("event", event, payload);
  }
  if (currentCategories.marketing) {
    if (window.fbq) window.fbq("trackCustom", event, payload);
    if (window.ttq) window.ttq.track(event, payload);
  }
};

/**
 * Applies a consent decision: updates Consent Mode, loads any tag that is now
 * permitted and configured, then flushes queued events. Idempotent — calling
 * it repeatedly with the same categories loads nothing twice.
 *
 * Withdrawing consent stops all further dispatch immediately. Scripts already
 * injected cannot be un-injected without a reload; the storage revocation sent
 * through Consent Mode is what actually stops the data collection, and a
 * reload clears the rest.
 */
export const syncConsent = (rawCategories) => {
  currentCategories = normalizeCategories(rawCategories);
  updateConsentMode(currentCategories);

  Object.entries(TAGS).forEach(([name, { category, id }]) => {
    const measurementId = trimmedId(id);
    if (!measurementId || loaded.has(name) || !currentCategories[category]) return;

    try {
      LOADERS[name](measurementId);
      loaded.add(name);
    } catch (error) {
      console.error(`Failed to load the ${name} tag:`, error);
    }
  });

  if (currentCategories.analytics || currentCategories.marketing) {
    const pending = queue;
    queue = [];
    pending.forEach(({ event, payload }) => dispatch(event, payload));
  }

  return currentCategories;
};

/**
 * Records a measurement event. Before consent it is queued; with consent
 * refused it is dropped. Safe to call from anywhere — it never throws and
 * never loads anything by itself.
 */
export const track = (event, payload = {}) => {
  if (!event) return;

  if (!currentCategories.analytics && !currentCategories.marketing) {
    // Bounded so a long pre-consent session cannot grow without limit.
    if (queue.length < 50) queue.push({ event, payload });
    return;
  }

  dispatch(event, payload);
};

/** Test/debug helper: what the loader currently believes it may do. */
export const getTagState = () => ({
  categories: { ...currentCategories },
  loaded: [...loaded],
  queued: queue.length,
});
