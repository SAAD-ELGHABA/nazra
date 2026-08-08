import { useEffect } from "react";
import { SITE_CONFIG } from "../config/site";

/**
 * Applies page metadata (title, description, canonical, robots, Open Graph)
 * and an optional JSON-LD graph, then restores the previous head state on
 * unmount.
 *
 * Restoring on unmount is what stops a stale `noindex`, canonical or title
 * leaking from one SPA route into the next — a client-rendered site has a
 * single <head> shared by every route, so every page must own its tags for
 * exactly as long as it is mounted.
 */
const HEAD_TAGS = [
  ["description", 'meta[name="description"]', "meta", { name: "description" }, "content"],
  ["robots", 'meta[name="robots"]', "meta", { name: "robots" }, "content"],
  ["title", 'meta[property="og:title"]', "meta", { property: "og:title" }, "content"],
  ["description", 'meta[property="og:description"]', "meta", { property: "og:description" }, "content"],
  ["canonical", 'meta[property="og:url"]', "meta", { property: "og:url" }, "content"],
  ["image", 'meta[property="og:image"]', "meta", { property: "og:image" }, "content"],
  ["type", 'meta[property="og:type"]', "meta", { property: "og:type" }, "content"],
  ["title", 'meta[name="twitter:title"]', "meta", { name: "twitter:title" }, "content"],
  ["description", 'meta[name="twitter:description"]', "meta", { name: "twitter:description" }, "content"],
  ["image", 'meta[name="twitter:image"]', "meta", { name: "twitter:image" }, "content"],
  ["canonical", 'link[rel="canonical"]', "link", { rel: "canonical" }, "href"],
];

export const ROBOTS_INDEX = "index, follow";
export const ROBOTS_NOINDEX = "noindex, follow";

/**
 * Builds a canonical URL on the single canonical host. Every canonical the app
 * emits goes through here so no page can ever advertise a `www.` URL.
 */
export const canonicalUrl = (path = "/") => {
  const normalized = `${path || "/"}`.split("?")[0].split("#")[0];
  if (normalized === "/") return `${SITE_CONFIG.url}/`;
  return `${SITE_CONFIG.url}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
};

/**
 * Absolute, publicly fetchable image URL, or null. Relative paths are resolved
 * against the canonical origin; anything else (blob:, data:, localhost) is
 * dropped rather than published as an unreachable og:image.
 */
export const absoluteImageUrl = (value) => {
  const candidate = `${value || ""}`.trim();
  if (!candidate) return null;
  if (candidate.startsWith("/")) return `${SITE_CONFIG.url}${candidate}`;
  return /^https?:\/\//i.test(candidate) ? candidate : null;
};

export function usePageSeo({
  title,
  description,
  canonical,
  image,
  type = "website",
  robots = ROBOTS_INDEX,
  jsonLd,
}) {
  // JSON-LD is serialized here so callers can pass a freshly built object
  // without the effect re-running on every render.
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    // A non-indexable page must not advertise a canonical URL: that would ask
    // Google to consolidate signals onto a page it is told not to index.
    const indexable = robots !== ROBOTS_NOINDEX && !`${robots}`.includes("noindex");
    const values = {
      title,
      description,
      canonical: indexable ? canonical : undefined,
      image,
      type,
      robots,
    };
    const previousTitle = document.title;
    if (title) document.title = title;

    const updates = HEAD_TAGS.filter(([valueKey]) => values[valueKey]).map(
      ([valueKey, selector, tagName, attributes, contentAttribute]) => {
        let element = document.head.querySelector(selector);
        const created = !element;
        if (!element) {
          element = document.createElement(tagName);
          Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
          document.head.appendChild(element);
        }
        const previousValue = element.getAttribute(contentAttribute);
        element.setAttribute(contentAttribute, values[valueKey]);
        return { element, contentAttribute, previousValue, created };
      },
    );

    // The static canonical in index.html points at the homepage. On a
    // noindex route it has to be removed for the duration, not left behind.
    let removedCanonical = null;
    if (!indexable) {
      const canonicalLink = document.head.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        removedCanonical = { element: canonicalLink, next: canonicalLink.nextSibling };
        canonicalLink.remove();
      }
    }

    let script = null;
    if (serializedJsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.nazraSeo = "true";
      script.textContent = serializedJsonLd;
      document.head.appendChild(script);
    }

    return () => {
      document.title = previousTitle;
      updates.forEach(({ element, contentAttribute, previousValue, created }) => {
        if (created) element.remove();
        else if (previousValue === null) element.removeAttribute(contentAttribute);
        else element.setAttribute(contentAttribute, previousValue);
      });
      if (removedCanonical) {
        document.head.insertBefore(removedCanonical.element, removedCanonical.next);
      }
      script?.remove();
    };
  }, [title, description, canonical, image, type, robots, serializedJsonLd]);
}

/**
 * Marks a route as non-indexable. `follow` is kept so Google still walks the
 * internal links out of the page (a checkout page still links to the catalog).
 */
export function useNoIndex(title) {
  usePageSeo({ title, robots: ROBOTS_NOINDEX });
}

export default usePageSeo;
