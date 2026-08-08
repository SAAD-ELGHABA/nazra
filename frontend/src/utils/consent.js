/**
 * Cookie consent record — storage and validation.
 *
 * Deliberately free of React so the same rules can be applied by the inline
 * snippet in index.html (which must run before any tag loads) and by
 * ConsentContext.
 *
 * The governing principle is prior consent: until the visitor makes a choice,
 * every non-essential category is denied. An absent, corrupt or out-of-date
 * record is therefore never treated as permission — it is treated as "not
 * asked yet".
 */

export const CONSENT_STORAGE_KEY = "nazra_consent";

/**
 * Bump this whenever a new tracker or category is introduced. Stored records
 * from an older version stop counting as a decision, so every visitor is asked
 * again rather than being silently opted into something they never saw.
 */
export const CONSENT_VERSION = 1;

/** `necessary` is always on: without it the cart, language and login break. */
export const CONSENT_CATEGORIES = Object.freeze(["necessary", "analytics", "marketing"]);

export const DENIED_CATEGORIES = Object.freeze({
  necessary: true,
  analytics: false,
  marketing: false,
});

export const ALL_GRANTED = Object.freeze({
  necessary: true,
  analytics: true,
  marketing: true,
});

const isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

/**
 * Normalizes any category input to the exact known shape. Unknown keys are
 * dropped and `necessary` is forced on, so a hand-edited localStorage value
 * can never grant a category the app does not know about.
 */
export const normalizeCategories = (value) => {
  const source = isPlainObject(value) ? value : {};
  return {
    necessary: true,
    analytics: source.analytics === true,
    marketing: source.marketing === true,
  };
};

/**
 * Returns the stored decision, or null when there is none to honour — absent,
 * unparseable, wrong shape, or written by an older consent version.
 */
export const readStoredConsent = () => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!isPlainObject(parsed)) return null;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (!isPlainObject(parsed.categories)) return null;

    return {
      version: CONSENT_VERSION,
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : null,
      categories: normalizeCategories(parsed.categories),
    };
  } catch (error) {
    console.error("Failed to read the consent record:", error);
    return null;
  }
};

/**
 * Persists a decision with the version and timestamp that make it auditable.
 * Storage can throw (Safari private browsing, quota, disabled storage) — the
 * choice still applies for this session, it simply is not remembered.
 */
export const writeStoredConsent = (categories) => {
  const record = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: normalizeCategories(categories),
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Failed to store the consent record:", error);
  }

  return record;
};

export const clearStoredConsent = () => {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear the consent record:", error);
  }
};
