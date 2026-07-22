const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CatalogValidationError,
  buildFacetPipelines,
  buildProductMatch,
  parseCatalogQuery
} = require('../services/productCatalogService');

test('keeps requests without page in legacy mode', () => {
  const options = parseCatalogQuery({ limit: '4', type: 'Aviator' });
  assert.equal(options.paginated, false);
  assert.equal(options.page, undefined);
  assert.equal(options.limit, 4);
  assert.equal(options.sort, 'newest');
  assert.deepEqual(options.shapes, ['Aviator']);
});

test('parses plural aliases, booleans, price aliases and pagination', () => {
  const options = parseCatalogQuery({
    page: '2',
    pageSize: '12',
    categories: 'Men,Women',
    collections: ['Atlas', 'Casa'],
    shapes: 'Round',
    colors: 'Black,#fff',
    min: '99.90',
    max: '400',
    polarized: '1',
    uv400: 'false',
    stock: 'low-stock,in-stock',
    sortBy: 'price-asc',
    include: 'facets'
  });

  assert.equal(options.paginated, true);
  assert.equal(options.page, 2);
  assert.equal(options.limit, 12);
  assert.equal(options.sort, 'price_asc');
  assert.equal(options.polarized, true);
  assert.equal(options.uv400, false);
  assert.equal(options.minPrice, 99.9);
  assert.equal(options.maxPrice, 400);
  assert.equal(options.includeFilters, true);
  assert.deepEqual(options.genders, ['Men', 'Women']);
  assert.deepEqual(options.collections, ['Atlas', 'Casa']);
  assert.deepEqual(options.stockStatuses, ['low_stock', 'in_stock']);
});

test('deduplicates aliases case-insensitively', () => {
  const options = parseCatalogQuery({ gender: 'Men', categories: 'men,Women' });
  assert.deepEqual(options.genders, ['Men', 'Women']);
});

test('enforces the filter value limit after combining aliases', () => {
  const firstAlias = Array.from({ length: 11 }, (_, index) => `gender-${index}`).join(',');
  const secondAlias = Array.from({ length: 10 }, (_, index) => `category-${index}`).join(',');
  assert.throws(
    () => parseCatalogQuery({ genders: firstAlias, categories: secondAlias }),
    /across all aliases/
  );
});

test('rejects unknown, malformed and conflicting values', () => {
  const invalidQueries = [
    { page: '0' },
    { page: '1.5' },
    { limit: '101' },
    { color: 'black,,blue' },
    { minPrice: '10.123' },
    { minPrice: '20', maxPrice: '10' },
    { polarized: 'yes' },
    { stock: 'out_of_stock', inStock: 'true' },
    { sort: 'random' },
    { page: '1', unsupported: 'value' },
    { search: 'one', q: 'two' }
  ];

  for (const query of invalidQueries) {
    assert.throws(() => parseCatalogQuery(query), CatalogValidationError);
  }
});

test('builds old-field fallbacks and normalized stock expressions', () => {
  const options = parseCatalogQuery({
    gender: 'Men',
    shape: 'Round',
    color: 'Black',
    inStock: 'true',
    minPrice: '100'
  });
  const serialized = JSON.stringify(buildProductMatch(options));

  assert.match(serialized, /gender/);
  assert.match(serialized, /category/);
  assert.match(serialized, /frameShape/);
  assert.match(serialized, /type/);
  assert.match(serialized, /colors/);
  assert.match(serialized, /stockStatus/);
  assert.match(serialized, /sale_price/);
});

test('uses the same null-or-empty taxonomy fallback in matches and facets', () => {
  const options = parseCatalogQuery({ page: '1', gender: 'Men', shape: 'Round', include: 'facets' });
  const match = JSON.stringify(buildProductMatch(options));
  const facets = JSON.stringify(buildFacetPipelines(options));

  for (const serialized of [match, facets]) {
    assert.match(serialized, /\$trim/);
    assert.match(serialized, /gender/);
    assert.match(serialized, /category/);
    assert.match(serialized, /frameShape/);
    assert.match(serialized, /type/);
  }
});
