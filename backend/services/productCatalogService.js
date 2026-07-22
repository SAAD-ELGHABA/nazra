const Product = require('../models/Product');
const Order = require('../models/Order');

const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 1000000;
const DEFAULT_PAGE_SIZE = 24;
const MAX_FILTER_VALUES = 20;
const MAX_FILTER_VALUE_LENGTH = 100;
const MAX_SEARCH_LENGTH = 100;
const MAX_PRICE = 10000000;
const CATALOG_AGGREGATION_TIMEOUT_MS = 4000;
const SALES_STATUSES = ['processing', 'shipped', 'delivered'];

const ALLOWED_QUERY_KEYS = new Set([
  'page', 'limit', 'pageSize', 'sort', 'sortBy', 'search', 'q',
  'gender', 'genders', 'category', 'categories',
  'collection', 'collections', 'shape', 'shapes', 'type', 'types',
  'color', 'colors', 'polarized', 'uv400',
  'stock', 'stocks', 'stockStatus', 'inStock',
  'minPrice', 'maxPrice', 'min', 'max', 'include', 'facets'
]);

const SORT_ALIASES = {
  'best-sellers': 'best_selling',
  'best-selling': 'best_selling',
  bestsellers: 'best_selling',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  'top-rated': 'top_rated',
  discount: 'discount_desc'
};
const ALLOWED_SORTS = new Set([
  'best_selling',
  'newest',
  'price_asc',
  'price_desc',
  'top_rated',
  'discount_desc'
]);
const STOCK_ALIASES = {
  available: 'in_stock',
  instock: 'in_stock',
  'in-stock': 'in_stock',
  in_stock: 'in_stock',
  lowstock: 'low_stock',
  'low-stock': 'low_stock',
  low_stock: 'low_stock',
  unavailable: 'out_of_stock',
  outofstock: 'out_of_stock',
  'out-of-stock': 'out_of_stock',
  out_of_stock: 'out_of_stock'
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const exactCaseInsensitive = (value) => new RegExp(`^${escapeRegExp(value)}$`, 'i');
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

class CatalogValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CatalogValidationError';
  }
}

const rejectUnknownQueryKeys = (query) => {
  const unknown = Object.keys(query).filter((key) => !ALLOWED_QUERY_KEYS.has(key));
  if (unknown.length) {
    throw new CatalogValidationError(`Unsupported query parameter${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`);
  }
};

const readScalarAlias = (query, aliases, name) => {
  const supplied = aliases.filter((alias) => hasOwn(query, alias));
  if (!supplied.length) return undefined;

  const values = supplied.map((alias) => query[alias]);
  if (values.some((value) => typeof value !== 'string')) {
    throw new CatalogValidationError(`${name} must be a single string value`);
  }

  const normalized = values.map((value) => value.trim());
  if (new Set(normalized).size > 1) {
    throw new CatalogValidationError(`${name} aliases cannot contain conflicting values`);
  }
  return values[0];
};

const parsePositiveInteger = (value, name, maximum) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value.trim())) {
    throw new CatalogValidationError(`${name} must be an integer between 1 and ${maximum}`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new CatalogValidationError(`${name} must be an integer between 1 and ${maximum}`);
  }
  return parsed;
};

const parsePrice = (value, name) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
    throw new CatalogValidationError(`${name} must be a non-negative number with at most two decimals`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed > MAX_PRICE) {
    throw new CatalogValidationError(`${name} must be between 0 and ${MAX_PRICE}`);
  }
  return parsed;
};

const parseSearch = (value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new CatalogValidationError('search must be a string');

  const search = value.trim();
  if (!search || search.length > MAX_SEARCH_LENGTH) {
    throw new CatalogValidationError(`search must contain between 1 and ${MAX_SEARCH_LENGTH} characters`);
  }
  return search;
};

const parseMultiValue = (rawValues, name) => {
  if (rawValues === undefined) return [];
  const entries = Array.isArray(rawValues) ? rawValues : [rawValues];
  if (!entries.every((entry) => typeof entry === 'string')) {
    throw new CatalogValidationError(`${name} must be a string or a comma-separated list`);
  }

  const values = entries.flatMap((entry) => entry.split(',')).map((entry) => entry.trim());
  if (!values.length || values.some((value) => !value)) {
    throw new CatalogValidationError(`${name} cannot contain empty values`);
  }
  if (values.length > MAX_FILTER_VALUES) {
    throw new CatalogValidationError(`${name} cannot contain more than ${MAX_FILTER_VALUES} values`);
  }
  if (values.some((value) => value.length > MAX_FILTER_VALUE_LENGTH)) {
    throw new CatalogValidationError(`${name} values cannot exceed ${MAX_FILTER_VALUE_LENGTH} characters`);
  }

  const seen = new Set();
  return values.filter((value) => {
    const normalized = value.toLocaleLowerCase('en');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const readMultiAliases = (query, aliases, name) => {
  const values = aliases.flatMap((alias) => parseMultiValue(query[alias], name));
  const seen = new Set();
  const uniqueValues = values.filter((value) => {
    const normalized = value.toLocaleLowerCase('en');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  if (uniqueValues.length > MAX_FILTER_VALUES) {
    throw new CatalogValidationError(`${name} cannot contain more than ${MAX_FILTER_VALUES} values across all aliases`);
  }
  return uniqueValues;
};

const parseBoolean = (value, name) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new CatalogValidationError(`${name} must be true or false`);
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  throw new CatalogValidationError(`${name} must be true or false`);
};

const parseInclude = (query) => {
  const include = readMultiAliases(query, ['include'], 'include');
  if (include.some((item) => !['filters', 'facets'].includes(item.toLowerCase()))) {
    throw new CatalogValidationError('include only supports filters or facets');
  }
  const facets = parseBoolean(query.facets, 'facets');
  return facets === true || include.length > 0;
};

const parseSort = (value, paginated) => {
  if (value === undefined) return paginated ? 'best_selling' : 'newest';
  if (typeof value !== 'string') {
    throw new CatalogValidationError(`sort must be one of: ${[...ALLOWED_SORTS].join(', ')}`);
  }
  const raw = value.trim().toLowerCase();
  const normalized = SORT_ALIASES[raw] || raw;
  if (!ALLOWED_SORTS.has(normalized)) {
    throw new CatalogValidationError(`sort must be one of: ${[...ALLOWED_SORTS].join(', ')}`);
  }
  return normalized;
};

const parseStock = (query) => {
  const rawStocks = readMultiAliases(query, ['stock', 'stocks', 'stockStatus'], 'stock');
  let inStock = parseBoolean(query.inStock, 'inStock');
  const statuses = [];

  for (const rawValue of rawStocks) {
    const normalized = rawValue.toLowerCase();
    if (['true', '1', 'false', '0'].includes(normalized)) {
      const parsed = parseBoolean(rawValue, 'stock');
      if (inStock !== undefined && inStock !== parsed) {
        throw new CatalogValidationError('stock and inStock cannot contain conflicting values');
      }
      inStock = parsed;
      continue;
    }
    const status = STOCK_ALIASES[normalized];
    if (!status) {
      throw new CatalogValidationError('stock must be true, false, in_stock, low_stock or out_of_stock');
    }
    if (!statuses.includes(status)) statuses.push(status);
  }

  if (inStock === false && statuses.some((status) => status !== 'out_of_stock')) {
    throw new CatalogValidationError('stock status conflicts with inStock=false');
  }
  if (inStock === true && statuses.includes('out_of_stock')) {
    throw new CatalogValidationError('stock status conflicts with inStock=true');
  }
  return { statuses, inStock };
};

const parseCatalogQuery = (query = {}) => {
  rejectUnknownQueryKeys(query);
  const page = parsePositiveInteger(readScalarAlias(query, ['page'], 'page'), 'page', MAX_PAGE);
  const paginated = page !== undefined;
  const limit = parsePositiveInteger(
    readScalarAlias(query, ['limit', 'pageSize'], 'limit'),
    'limit',
    MAX_PAGE_SIZE
  );
  const minPrice = parsePrice(readScalarAlias(query, ['minPrice', 'min'], 'minPrice'), 'minPrice');
  const maxPrice = parsePrice(readScalarAlias(query, ['maxPrice', 'max'], 'maxPrice'), 'maxPrice');
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new CatalogValidationError('minPrice cannot be greater than maxPrice');
  }

  const stock = parseStock(query);
  return {
    paginated,
    page,
    limit: limit === undefined && paginated ? DEFAULT_PAGE_SIZE : limit,
    genders: readMultiAliases(query, ['gender', 'genders', 'category', 'categories'], 'gender'),
    collections: readMultiAliases(query, ['collection', 'collections'], 'collection'),
    shapes: readMultiAliases(query, ['shape', 'shapes', 'type', 'types'], 'shape'),
    colors: readMultiAliases(query, ['color', 'colors'], 'color'),
    polarized: parseBoolean(query.polarized, 'polarized'),
    uv400: parseBoolean(query.uv400, 'uv400'),
    stockStatuses: stock.statuses,
    inStock: stock.inStock,
    minPrice,
    maxPrice,
    search: parseSearch(readScalarAlias(query, ['search', 'q'], 'search')),
    sort: parseSort(readScalarAlias(query, ['sort', 'sortBy'], 'sort'), paginated),
    includeFilters: parseInclude(query)
  };
};

const effectiveStockStatusExpression = {
  $cond: [
    { $in: ['$stockStatus', ['in_stock', 'low_stock', 'out_of_stock']] },
    '$stockStatus',
    { $cond: [{ $eq: ['$inStock', false] }, 'out_of_stock', 'in_stock'] }
  ]
};

const nonEmptyStringFallbackExpression = (primaryField, fallbackField) => ({
  $let: {
    vars: {
      primary: {
        $cond: [
          { $eq: [{ $type: primaryField }, 'string'] },
          { $trim: { input: primaryField } },
          ''
        ]
      },
      fallback: {
        $cond: [
          { $eq: [{ $type: fallbackField }, 'string'] },
          { $trim: { input: fallbackField } },
          ''
        ]
      }
    },
    in: { $cond: [{ $ne: ['$$primary', ''] }, '$$primary', '$$fallback'] }
  }
});

const effectiveGenderExpression = nonEmptyStringFallbackExpression('$gender', '$category');
const effectiveShapeExpression = nonEmptyStringFallbackExpression('$frameShape', '$type');

const exactValuesExpression = (input, values) => ({
  $regexMatch: {
    input,
    regex: `^(?:${values.map(escapeRegExp).join('|')})$`,
    options: 'i'
  }
});

const buildProductMatch = (options, omittedDimensions = []) => {
  const omitted = new Set(Array.isArray(omittedDimensions) ? omittedDimensions : [omittedDimensions]);
  const conditions = [];
  if (!omitted.has('base')) conditions.push({ isActive: true });
  if (options.search && !omitted.has('search')) conditions.push({ $text: { $search: options.search } });

  if (options.genders.length && !omitted.has('gender')) {
    conditions.push({ $expr: exactValuesExpression(effectiveGenderExpression, options.genders) });
  }
  if (options.collections.length && !omitted.has('collection')) {
    conditions.push({ collection: { $in: options.collections.map(exactCaseInsensitive) } });
  }
  if (options.shapes.length && !omitted.has('shape')) {
    conditions.push({ $expr: exactValuesExpression(effectiveShapeExpression, options.shapes) });
  }
  if (options.colors.length && !omitted.has('color')) {
    const values = options.colors.map(exactCaseInsensitive);
    conditions.push({
      colors: { $elemMatch: { $or: [{ name: { $in: values } }, { value: { $in: values } }] } }
    });
  }
  if (options.polarized !== undefined && !omitted.has('polarized')) {
    conditions.push({ $expr: { $eq: [{ $ifNull: ['$polarized', false] }, options.polarized] } });
  }
  if (options.uv400 !== undefined && !omitted.has('uv400')) {
    conditions.push({ $expr: { $eq: [{ $ifNull: ['$uv400', false] }, options.uv400] } });
  }
  if (!omitted.has('stock')) {
    if (options.stockStatuses.length) {
      conditions.push({ $expr: { $in: [effectiveStockStatusExpression, options.stockStatuses] } });
    }
    if (options.inStock !== undefined) {
      conditions.push({
        $expr: { $eq: [{ $ne: [effectiveStockStatusExpression, 'out_of_stock'] }, options.inStock] }
      });
    }
  }
  if (!omitted.has('price') && (options.minPrice !== undefined || options.maxPrice !== undefined)) {
    const price = {};
    if (options.minPrice !== undefined) price.$gte = options.minPrice;
    if (options.maxPrice !== undefined) price.$lte = options.maxPrice;
    conditions.push({ sale_price: price });
  }

  if (!conditions.length) return {};
  return conditions.length === 1 ? conditions[0] : { $and: conditions };
};

const getMongoSort = (sort) => {
  switch (sort) {
    case 'price_asc': return { sale_price: 1, _id: 1 };
    case 'price_desc': return { sale_price: -1, _id: 1 };
    case 'top_rated': return { ratingAverage: -1, reviewCount: -1, sortPriority: -1, _id: 1 };
    case 'discount_desc': return { discountPercentage: -1, sortPriority: -1, _id: 1 };
    case 'best_selling': return { salesQuantity: -1, sortPriority: -1, createdAt: -1, _id: 1 };
    case 'newest':
    default: return { createdAt: -1, _id: 1 };
  }
};

const discountStage = {
  $set: {
    discountPercentage: {
      $let: {
        vars: { comparePrice: { $ifNull: ['$compareAtPrice', '$original_price'] } },
        in: {
          $cond: [
            { $and: [{ $gt: ['$$comparePrice', 0] }, { $gt: ['$$comparePrice', '$sale_price'] }] },
            { $round: [{ $multiply: [{ $divide: [{ $subtract: ['$$comparePrice', '$sale_price'] }, '$$comparePrice'] }, 100] }, 0] },
            0
          ]
        }
      }
    },
    _effectiveStockStatus: effectiveStockStatusExpression
  }
};

const publicProjectionStage = {
  $project: {
    _id: 1,
    name: 1,
    slug: 1,
    original_price: 1,
    sale_price: 1,
    compareAtPrice: 1,
    discountPercentage: 1,
    type: 1,
    category: 1,
    gender: 1,
    collection: 1,
    frameShape: 1,
    references: 1,
    description: 1,
    uv400: { $ifNull: ['$uv400', false] },
    polarized: { $ifNull: ['$polarized', false] },
    badges: { $ifNull: ['$badges', []] },
    ratingAverage: { $ifNull: ['$ratingAverage', 0] },
    reviewCount: { $ifNull: ['$reviewCount', 0] },
    stockStatus: '$_effectiveStockStatus',
    inStock: { $ne: ['$_effectiveStockStatus', 'out_of_stock'] },
    sortPriority: { $ifNull: ['$sortPriority', 0] },
    createdAt: 1,
    updatedAt: 1,
    colors: {
      $map: {
        input: { $ifNull: ['$colors', []] },
        as: 'color',
        in: {
          _id: '$$color._id',
          name: '$$color.name',
          value: '$$color.value',
          images: {
            $map: {
              input: { $ifNull: ['$$color.images', []] },
              as: 'image',
              in: { url: '$$image.url' }
            }
          }
        }
      }
    }
  }
};

const salesLookupStages = [
  {
    $lookup: {
      from: Order.collection.name,
      let: { productId: '$_id' },
      pipeline: [
        { $match: { status: { $in: SALES_STATUSES } } },
        { $unwind: '$products' },
        { $match: { $expr: { $and: [{ $eq: ['$products.product', '$$productId'] }, { $gt: ['$products.quantity', 0] }] } } },
        { $group: { _id: null, quantity: { $sum: '$products.quantity' } } }
      ],
      as: '_sales'
    }
  },
  { $set: { salesQuantity: { $ifNull: [{ $first: '$_sales.quantity' }, 0] } } },
  { $unset: '_sales' }
];

const facetMatchStages = (options, omittedDimension) => {
  const match = buildProductMatch(options, ['base', 'search', omittedDimension]);
  return Object.keys(match).length ? [{ $match: match }] : [];
};

const namedFacetStages = (options, dimension, expression, extraStages = []) => [
  ...facetMatchStages(options, dimension),
  { $project: { productId: '$_id', value: expression, ...Object.fromEntries(extraStages.map(({ name, expression: item }) => [name, item])) } },
  { $match: { value: { $type: 'string', $ne: '' } } },
  { $group: { _id: { productId: '$productId', normalized: { $toLower: '$value' } }, value: { $first: '$value' }, ...Object.fromEntries(extraStages.map(({ name }) => [name, { $first: `$${name}` }])) } },
  { $group: { _id: '$_id.normalized', value: { $first: '$value' }, count: { $sum: 1 }, ...Object.fromEntries(extraStages.map(({ name }) => [name, { $first: `$${name}` }])) } },
  { $project: { _id: 0, value: 1, count: 1, ...Object.fromEntries(extraStages.map(({ name }) => [name, 1])) } },
  { $sort: { value: 1 } }
];

const booleanFacetStages = (options, dimension, expression) => [
  ...facetMatchStages(options, dimension),
  { $group: { _id: expression, count: { $sum: 1 } } },
  { $project: { _id: 0, value: '$_id', count: 1 } },
  { $sort: { value: -1 } }
];

const buildFacetPipelines = (options) => ({
  genders: namedFacetStages(options, 'gender', effectiveGenderExpression),
  collections: namedFacetStages(options, 'collection', '$collection'),
  shapes: namedFacetStages(options, 'shape', effectiveShapeExpression),
  colors: [
    ...facetMatchStages(options, 'color'),
    { $unwind: '$colors' },
    { $project: { productId: '$_id', value: '$colors.name', swatch: '$colors.value' } },
    { $match: { value: { $type: 'string', $ne: '' } } },
    { $group: { _id: { productId: '$productId', normalized: { $toLower: '$value' } }, value: { $first: '$value' }, swatch: { $first: '$swatch' } } },
    { $group: { _id: '$_id.normalized', value: { $first: '$value' }, swatch: { $first: '$swatch' }, count: { $sum: 1 } } },
    { $project: { _id: 0, value: 1, swatch: 1, color: '$swatch', hex: '$swatch', count: 1 } },
    { $sort: { value: 1 } }
  ],
  polarized: booleanFacetStages(options, 'polarized', { $ifNull: ['$polarized', false] }),
  uv400: booleanFacetStages(options, 'uv400', { $ifNull: ['$uv400', false] }),
  stock: [
    ...facetMatchStages(options, 'stock'),
    { $group: { _id: effectiveStockStatusExpression, count: { $sum: 1 } } },
    { $project: { _id: 0, value: '$_id', count: 1 } },
    { $sort: { value: 1 } }
  ],
  price: [
    ...facetMatchStages(options, 'price'),
    { $match: { sale_price: { $type: 'number' } } },
    { $group: { _id: null, min: { $min: '$sale_price' }, max: { $max: '$sale_price' } } },
    { $project: { _id: 0, min: 1, max: 1 } }
  ]
});

const emptyFilters = () => ({
  genders: [],
  categories: [],
  collections: [],
  shapes: [],
  types: [],
  colors: [],
  polarized: [],
  uv400: [],
  stock: [],
  price: { min: null, max: null },
  scope: 'contextual'
});

const normalizeFilters = (result) => {
  const filters = emptyFilters();
  filters.genders = result.genders || [];
  filters.categories = filters.genders;
  filters.collections = result.collections || [];
  filters.shapes = result.shapes || [];
  filters.types = filters.shapes;
  filters.colors = result.colors || [];
  filters.polarized = result.polarized || [];
  filters.uv400 = result.uv400 || [];
  filters.stock = result.stock || [];
  filters.price = result.price?.[0] || filters.price;
  return filters;
};

const productStages = (options, paginated) => {
  const stages = [];
  if (options.sort === 'best_selling') stages.push(...salesLookupStages);
  stages.push({ $sort: getMongoSort(options.sort) });
  if (paginated) stages.push({ $skip: (options.page - 1) * options.limit }, { $limit: options.limit });
  else if (options.limit !== undefined) stages.push({ $limit: options.limit });
  stages.push(publicProjectionStage);
  return stages;
};

const aggregateCatalog = async (options, paginated) => {
  const commonMatch = buildProductMatch(options, ['gender', 'collection', 'shape', 'color', 'polarized', 'uv400', 'stock', 'price']);
  const fullMatch = buildProductMatch(options, ['base', 'search']);
  const pipeline = [{ $match: commonMatch }];

  if (!paginated) {
    if (Object.keys(fullMatch).length) pipeline.push({ $match: fullMatch });
    pipeline.push(discountStage, ...productStages(options, false));
    return Product.aggregate(pipeline).option({ maxTimeMS: CATALOG_AGGREGATION_TIMEOUT_MS });
  }

  const filteredStages = Object.keys(fullMatch).length ? [{ $match: fullMatch }] : [];
  const facets = {
    products: [...filteredStages, discountStage, ...productStages(options, true)],
    total: [...filteredStages, { $count: 'value' }]
  };
  if (options.includeFilters) Object.assign(facets, buildFacetPipelines(options));
  pipeline.push({ $facet: facets });

  const [result = {}] = await Product.aggregate(pipeline).option({ maxTimeMS: CATALOG_AGGREGATION_TIMEOUT_MS });
  return result;
};

const getPaginatedProducts = async (options) => {
  const result = await aggregateCatalog(options, true);
  const total = result.total?.[0]?.value || 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / options.limit);
  const outOfRange = totalPages > 0 && options.page > totalPages;
  const response = {
    success: true,
    products: result.products || [],
    pagination: {
      page: options.page,
      currentPage: options.page,
      limit: options.limit,
      total,
      totalCount: total,
      totalPages,
      hasPreviousPage: totalPages > 0 && options.page > 1,
      hasNextPage: options.page < totalPages,
      outOfRange
    },
    appliedFilters: {
      gender: options.genders,
      category: options.genders,
      collection: options.collections,
      shape: options.shapes,
      type: options.shapes,
      color: options.colors,
      polarized: options.polarized ?? null,
      uv400: options.uv400 ?? null,
      stock: options.stockStatuses,
      inStock: options.inStock ?? null,
      minPrice: options.minPrice ?? null,
      maxPrice: options.maxPrice ?? null,
      search: options.search ?? null,
      sort: options.sort
    }
  };
  if (options.includeFilters) response.filters = normalizeFilters(result);
  return response;
};

const listProducts = async (query) => {
  const options = parseCatalogQuery(query);
  if (!options.paginated) {
    return { success: true, products: await aggregateCatalog(options, false) };
  }
  return getPaginatedProducts(options);
};

module.exports = {
  CatalogValidationError,
  MAX_PAGE_SIZE,
  buildFacetPipelines,
  buildProductMatch,
  listProducts,
  parseCatalogQuery
};
