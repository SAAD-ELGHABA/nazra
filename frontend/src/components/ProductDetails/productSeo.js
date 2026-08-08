import { SITE_CONFIG } from "../../config/site";
import { absoluteImageUrl, canonicalUrl } from "../../hooks/usePageSeo";

/**
 * Product structured data.
 *
 * Rule of the file: emit a field only when the product data proves it.
 * Invalid structured data is worse than none — Google treats a price of 0, an
 * invented availability or a fabricated rating as a reason to drop the rich
 * result, and in the worst case as a manual action. Every builder below
 * returns null rather than guessing.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productCanonicalUrl = (slug) => {
  const normalized = `${slug || ""}`.trim().toLowerCase();
  return SLUG_PATTERN.test(normalized) ? canonicalUrl(`/product/${normalized}`) : null;
};

/** A price is only usable if it is a real, positive amount. */
const usablePrice = (...candidates) => {
  const price = candidates.map(Number).find((value) => Number.isFinite(value) && value > 0);
  return price === undefined ? null : price.toFixed(2);
};

/** SKUs are free-text in the admin form; reject anything that is not one. */
const usableSku = (...candidates) => {
  const sku = candidates
    .map((value) => `${value ?? ""}`.trim())
    .find((value) => value.length > 0 && value.length <= 100 && !/\s{2,}/.test(value));
  return sku || null;
};

const usableImages = (images) =>
  [...new Set(
    (Array.isArray(images) ? images : [])
      .map((item) => absoluteImageUrl(typeof item === "string" ? item : item?.url))
      .filter(Boolean),
  )];

/**
 * Availability from the resolved variant when there is one, otherwise from the
 * product-level stock summary the API computes from active variants.
 */
const availability = (product, variant) => {
  const available = variant ? variant.available !== false : product?.stock?.available;
  if (available === true) return "https://schema.org/InStock";
  if (available === false) return "https://schema.org/OutOfStock";
  return null;
};

/**
 * AggregateRating is emitted only from the review aggregation the API computes
 * over stored reviews. The placeholder homepage testimonials never reach here.
 */
const aggregateRating = (product) => {
  const count = Number(product?.rating?.count);
  const average = Number(product?.rating?.average);
  if (!Number.isFinite(count) || count < 1) return null;
  if (!Number.isFinite(average) || average <= 0 || average > 5) return null;

  return {
    "@type": "AggregateRating",
    ratingValue: Number(average.toFixed(2)),
    reviewCount: count,
    bestRating: 5,
    worstRating: 1,
  };
};

/**
 * Builds the Product + BreadcrumbList graph, or null when the product cannot
 * support valid markup (no canonical URL, no name, no image, or no price).
 */
export const buildProductJsonLd = ({ product, variant, images, description, catalogLabel, homeLabel }) => {
  if (!product) return null;

  const url = productCanonicalUrl(product.slug);
  const name = `${product.name || ""}`.trim();
  const imageUrls = usableImages(images?.length ? images : product.images);
  const price = usablePrice(variant?.price, product.prices?.current, product.sale_price);
  const stock = availability(product, variant);

  if (!url || !name) return null;

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeLabel, item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: catalogLabel, item: canonicalUrl("/store/products") },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };

  // Google requires an offer with a real price for a product rich result. With
  // no usable price or image there is nothing valid to publish, so the
  // BreadcrumbList ships on its own.
  if (!price || !imageUrls.length || !stock) {
    return { "@context": "https://schema.org", "@graph": [breadcrumb] };
  }

  const sku = usableSku(variant?.sku, product.references);
  const rating = aggregateRating(product);
  const trimmedDescription = `${description || ""}`.trim();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        image: imageUrls,
        ...(sku ? { sku } : {}),
        brand: { "@type": "Brand", name: SITE_CONFIG.name },
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "MAD",
          price,
          availability: stock,
          itemCondition: "https://schema.org/NewCondition",
        },
        ...(rating ? { aggregateRating: rating } : {}),
      },
      breadcrumb,
    ],
  };
};

export const productSeoImage = (images, product) =>
  usableImages(images?.length ? images : product?.images)[0] || null;
