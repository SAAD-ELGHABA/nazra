import { useEffect } from "react";

/**
 * Applies page metadata (title, description, canonical, Open Graph) and an
 * optional JSON-LD graph, then restores the previous head state on unmount.
 *
 * This consolidates the hand-rolled `document.head` logic that ProductPage and
 * AboutPage each implement separately. New pages should use this hook; the
 * existing two can be migrated to it when convenient.
 */
const HEAD_TAGS = [
  ["description", 'meta[name="description"]', "meta", { name: "description" }, "content"],
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

export function usePageSeo({ title, description, canonical, image, type = "website", jsonLd }) {
  useEffect(() => {
    const values = { title, description, canonical, image, type };
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

    let script = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.nazraSeo = "true";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = previousTitle;
      updates.forEach(({ element, contentAttribute, previousValue, created }) => {
        if (created) element.remove();
        else if (previousValue === null) element.removeAttribute(contentAttribute);
        else element.setAttribute(contentAttribute, previousValue);
      });
      script?.remove();
    };
  }, [title, description, canonical, image, type, jsonLd]);
}

export default usePageSeo;
