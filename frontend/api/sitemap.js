/**
 * Same-origin https://nazra.store/sitemap.xml
 *
 * The storefront and the API deploy as two separate Vercel projects. Google
 * only accepts a sitemap that lives on the same origin as the URLs it lists,
 * so this function proxies the backend sitemap through the storefront domain.
 *
 * The backend origin is read from the environment (never hardcoded), and a
 * static fallback guarantees a crawler always receives valid XML instead of
 * the SPA shell or a 500 if the API is unavailable.
 */

const SITE_URL = "https://nazra.store";

// Kept in sync with STATIC_ROUTES in backend/services/sitemapService.js. Used
// only when the API cannot be reached, so the homepage and the canonical
// catalog stay discoverable during a backend outage.
const FALLBACK_PATHS = [
  "/",
  "/store/products",
  "/store",
  "/about",
  "/discover",
  "/explore",
  "/contact-us",
  "/help-center",
  "/shipping-info",
  "/returns-policy",
  "/terms-and-conditions",
  "/terms-of-use",
  "/privacy-policy",
  "/cookie-policy",
];

const renderFallbackSitemap = () =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...FALLBACK_PATHS.map((path) =>
      `  <url>\n    <loc>${SITE_URL}${path === "/" ? "/" : path}</loc>\n  </url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");

/**
 * Resolves the API origin from deployment configuration. `SITEMAP_API_URL`
 * exists so the sitemap can be pointed at a different backend than the browser
 * bundle uses; otherwise the storefront's own `VITE_API_URL` is reused.
 */
const resolveSitemapSource = () => {
  const configured = (process.env.SITEMAP_API_URL || process.env.VITE_API_URL || "").trim();
  if (!configured) return null;

  try {
    const base = new URL(configured.endsWith("/") ? configured : `${configured}/`);
    if (base.protocol !== "https:" && base.protocol !== "http:") return null;
    return new URL("products/sitemap.xml", base).toString();
  } catch {
    return null;
  }
};

export default async function handler(request, response) {
  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("X-Robots-Tag", "noindex");

  const source = resolveSitemapSource();

  if (!source) {
    response.setHeader("Cache-Control", "public, max-age=60");
    return response.status(200).send(renderFallbackSitemap());
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstream = await fetch(source, {
      headers: { Accept: "application/xml" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await upstream.text();
    if (!upstream.ok || !body.trimStart().startsWith("<?xml")) {
      throw new Error(`Unexpected sitemap response: ${upstream.status}`);
    }

    response.setHeader("Cache-Control", "public, max-age=600, stale-while-revalidate=3600");
    return response.status(200).send(body);
  } catch (error) {
    console.error("Sitemap proxy failed:", error?.message || error);
    response.setHeader("Cache-Control", "public, max-age=60");
    return response.status(200).send(renderFallbackSitemap());
  }
}
