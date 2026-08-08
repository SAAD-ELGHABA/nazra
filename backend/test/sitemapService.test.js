const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildProductEntries,
  buildStaticEntries,
  escapeXml,
  normalizeSiteUrl,
  renderSitemapXml,
  toLastModified
} = require('../services/sitemapService');

const SITE = 'https://nazra.store';

test('escapes every XML metacharacter', () => {
  assert.equal(
    escapeXml(`a&b<c>d"e'f`),
    'a&amp;b&lt;c&gt;d&quot;e&apos;f'
  );
});

test('falls back to the canonical non-www origin for unusable values', () => {
  assert.equal(normalizeSiteUrl(undefined), SITE);
  assert.equal(normalizeSiteUrl(''), SITE);
  assert.equal(normalizeSiteUrl('not a url'), SITE);
  assert.equal(normalizeSiteUrl('ftp://nazra.store'), SITE);
});

test('keeps only the origin of a configured site url', () => {
  assert.equal(normalizeSiteUrl('https://nazra.store/store/products?a=1'), SITE);
  assert.equal(normalizeSiteUrl('  https://preview.example.com  '), 'https://preview.example.com');
});

test('accepts trustworthy dates only', () => {
  assert.equal(toLastModified(new Date('2026-02-03T10:20:30Z')), '2026-02-03');
  assert.equal(toLastModified('2026-02-03T10:20:30.000Z'), '2026-02-03');
  assert.equal(toLastModified(null), null);
  assert.equal(toLastModified('not a date'), null);
  assert.equal(toLastModified(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), null);
});

test('builds absolute canonical product urls from active products', () => {
  const entries = buildProductEntries([
    { slug: 'atlas-bold-geometric-aviator-sunglasses', updatedAt: new Date('2026-01-05T00:00:00Z'), isActive: true },
    { slug: 'verona-gold-round-metal-sunglasses', updatedAt: new Date('2026-03-05T00:00:00Z'), isActive: true }
  ], SITE);

  assert.deepEqual(entries.map((entry) => entry.loc), [
    'https://nazra.store/product/atlas-bold-geometric-aviator-sunglasses',
    'https://nazra.store/product/verona-gold-round-metal-sunglasses'
  ]);
  assert.equal(entries[0].lastmod, '2026-01-05');
});

test('drops archived products, invalid slugs and untrustworthy lastmod values', () => {
  const entries = buildProductEntries([
    { slug: 'archived-model', updatedAt: new Date('2026-01-05T00:00:00Z'), isActive: false },
    { slug: '', updatedAt: new Date('2026-01-05T00:00:00Z'), isActive: true },
    { slug: 'Has Spaces', updatedAt: new Date('2026-01-05T00:00:00Z'), isActive: true },
    { slug: '../../admins/dashboard', updatedAt: new Date('2026-01-05T00:00:00Z'), isActive: true },
    { slug: 'valid-model', updatedAt: 'nonsense', isActive: true },
    null
  ], SITE);

  assert.deepEqual(entries.map((entry) => entry.loc), ['https://nazra.store/product/valid-model']);
  assert.equal(entries[0].lastmod, null);
});

test('collapses duplicate slugs to the most recently updated entry', () => {
  const entries = buildProductEntries([
    { slug: 'duplicate-model', updatedAt: new Date('2026-01-01T00:00:00Z'), isActive: true },
    { slug: 'Duplicate-Model', updatedAt: new Date('2026-04-01T00:00:00Z'), isActive: true }
  ], SITE);

  assert.equal(entries.length, 1);
  assert.equal(entries[0].lastmod, '2026-04-01');
});

test('never advertises private, transactional or filtered urls', () => {
  const xml = renderSitemapXml([
    ...buildStaticEntries(SITE),
    ...buildProductEntries([{ slug: 'valid-model', updatedAt: new Date('2026-01-05T00:00:00Z'), isActive: true }], SITE)
  ]);

  ['/admins', '/login', '/forgot-password', '/reset-password', '/checkout-card', '/favorites', '/comming-soon-page']
    .forEach((fragment) => assert.equal(xml.includes(fragment), false, `sitemap must not contain ${fragment}`));

  // Filter, search, sort and pagination permutations must never be advertised.
  const locations = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
  locations.forEach((location) => assert.equal(location.includes('?'), false, `sitemap must not contain ${location}`));
});

test('renders a structurally valid urlset with one loc per url', () => {
  const xml = renderSitemapXml(buildStaticEntries(SITE));
  const locations = xml.match(/<loc>/g) || [];
  const urls = xml.match(/<url>/g) || [];

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.ok(xml.trimEnd().endsWith('</urlset>'));
  assert.equal(locations.length, urls.length);
  assert.ok(xml.includes('<loc>https://nazra.store/</loc>'));
  assert.ok(xml.includes('<loc>https://nazra.store/store/products</loc>'));
});

test('lists every static url exactly once', () => {
  const entries = buildStaticEntries(SITE);
  const locations = entries.map((entry) => entry.loc);
  assert.equal(new Set(locations).size, locations.length);
  locations.forEach((location) => assert.ok(location.startsWith('https://nazra.store'), location));
});
