const Product = require('../models/Product');

/**
 * Public XML sitemap generation.
 *
 * The storefront is a client-rendered Vite SPA, so product pages are not
 * discoverable by following rendered links alone. This service is the single
 * authoritative list of indexable public URLs that Google is told about.
 *
 * Only pages that are genuinely public and indexable belong here. Admin,
 * auth, checkout, favorites and filtered catalog URLs are deliberately absent
 * — they carry `noindex` on the client and must never be advertised.
 */

// Public canonical origin. Non-www is the canonical host for nazra.store; the
// value stays overridable so preview environments do not advertise production.
const DEFAULT_SITE_URL = 'https://nazra.store';

// Products are cheap to read but the sitemap is polled rarely. Ten minutes
// keeps a newly published product discoverable the same session without
// hitting MongoDB on every crawler request.
const SITEMAP_CACHE_TTL_MS = 10 * 60 * 1000;

// Static storefront pages worth indexing. Thin or transactional routes
// (/favorites, /checkout-card, /comming-soon-page, /login...) are excluded.
const STATIC_ROUTES = Object.freeze([
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/store/products', changefreq: 'daily', priority: '0.9' },
  { path: '/store', changefreq: 'monthly', priority: '0.6' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/discover', changefreq: 'monthly', priority: '0.5' },
  { path: '/explore', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact-us', changefreq: 'yearly', priority: '0.4' },
  { path: '/help-center', changefreq: 'yearly', priority: '0.3' },
  { path: '/shipping-info', changefreq: 'yearly', priority: '0.3' },
  { path: '/returns-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms-of-use', changefreq: 'yearly', priority: '0.2' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
  { path: '/cookie-policy', changefreq: 'yearly', priority: '0.2' },
]);

// Same shape the product router accepts, so a sitemap URL can never point at a
// route the SPA would resolve to a 404.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const normalizeSiteUrl = (value) => {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) return DEFAULT_SITE_URL;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return DEFAULT_SITE_URL;
    return `${parsed.origin}`;
  } catch {
    return DEFAULT_SITE_URL;
  }
};

/**
 * `lastmod` is optional in the sitemap protocol and an inaccurate value is
 * worse than none, so anything that is not a real date is dropped.
 */
const toLastModified = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  if (!Number.isFinite(time) || time <= 0 || time > Date.now() + 24 * 60 * 60 * 1000) return null;
  return date.toISOString().slice(0, 10);
};

/**
 * Turns raw product documents into sitemap entries, dropping anything that
 * cannot produce a valid canonical product URL. Duplicate slugs collapse to a
 * single entry (the most recently updated one wins).
 */
const buildProductEntries = (products, siteUrl = DEFAULT_SITE_URL) => {
  const origin = normalizeSiteUrl(siteUrl);
  const bySlug = new Map();

  (Array.isArray(products) ? products : []).forEach((product) => {
    if (!product || product.isActive === false) return;
    const slug = typeof product.slug === 'string' ? product.slug.trim().toLowerCase() : '';
    if (!slug || !SLUG_PATTERN.test(slug)) return;

    const lastmod = toLastModified(product.updatedAt);
    const existing = bySlug.get(slug);
    if (existing && (existing.lastmod || '') >= (lastmod || '')) return;

    bySlug.set(slug, {
      loc: `${origin}/product/${slug}`,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  return [...bySlug.values()].sort((a, b) => a.loc.localeCompare(b.loc));
};

const buildStaticEntries = (siteUrl = DEFAULT_SITE_URL) => {
  const origin = normalizeSiteUrl(siteUrl);
  return STATIC_ROUTES.map(({ path, changefreq, priority }) => ({
    loc: path === '/' ? `${origin}/` : `${origin}${path}`,
    lastmod: null,
    changefreq,
    priority,
  }));
};

const renderUrlEntry = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
  ...(changefreq ? [`    <changefreq>${escapeXml(changefreq)}</changefreq>`] : []),
  ...(priority ? [`    <priority>${escapeXml(priority)}</priority>`] : []),
  '  </url>',
].join('\n');

const renderSitemapXml = (entries) => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...(Array.isArray(entries) ? entries.map(renderUrlEntry) : []),
  '</urlset>',
  '',
].join('\n');

let cache = null;

const buildSitemap = async ({ siteUrl } = {}) => {
  const origin = normalizeSiteUrl(siteUrl || process.env.PUBLIC_SITE_URL);

  if (cache && cache.origin === origin && cache.expiresAt > Date.now()) {
    return cache.xml;
  }

  const products = await Product.find({ isActive: true })
    .select('slug updatedAt')
    .sort({ updatedAt: -1, _id: 1 })
    .limit(50000)
    .lean();

  const xml = renderSitemapXml([
    ...buildStaticEntries(origin),
    ...buildProductEntries(products, origin),
  ]);

  cache = { origin, xml, expiresAt: Date.now() + SITEMAP_CACHE_TTL_MS };
  return xml;
};

const clearSitemapCache = () => {
  cache = null;
};

module.exports = {
  DEFAULT_SITE_URL,
  SITEMAP_CACHE_TTL_MS,
  STATIC_ROUTES,
  buildProductEntries,
  buildSitemap,
  buildStaticEntries,
  clearSitemapCache,
  escapeXml,
  normalizeSiteUrl,
  renderSitemapXml,
  toLastModified,
};
