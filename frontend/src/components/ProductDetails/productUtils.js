const asId = (value) => String(value?._id ?? value?.id ?? value ?? "");

export const getLocalizedText = (value, language = "fr") => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const lang = language.split("-")[0];
  return value[lang]?.trim?.() || value.fr?.trim?.() || value.en?.trim?.() || value.ar?.trim?.() || "";
};

export const getColorId = (color) => asId(color);
export const getLensId = (lens) => asId(lens);

export const getInitialColor = (product) => {
  const colors = Array.isArray(product?.colors) ? product.colors.filter((color) => color?.active !== false) : [];
  return colors.find((color) => color.available !== false) || colors[0] || null;
};

export const getInitialLens = (color) => {
  const lenses = Array.isArray(color?.lensOptions) ? color.lensOptions.filter((lens) => lens?.active !== false) : [];
  return lenses.find((lens) => lens.available !== false) || lenses[0] || null;
};

export const resolveVariant = (product, color, lens) => {
  if (!color) return null;
  const colorId = getColorId(color);
  const lensId = getLensId(lens);
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const match = variants.find((variant) => (
    asId(variant.colorId) === colorId && asId(variant.lensOptionId) === lensId
  ));
  if (match) return match;
  if (!lens && (!Array.isArray(color.lensOptions) || color.lensOptions.length === 0)) {
    return {
      id: colorId,
      colorId,
      lensOptionId: null,
      sku: color.sku || null,
      price: color.price,
      compareAtPrice: color.compareAtPrice,
      discountPercentage: color.discountPercentage,
      stock: color.stock,
      stockStatus: color.stockStatus,
      available: color.available !== false,
      images: color.images || [],
    };
  }
  return null;
};

export const getGalleryImages = (product, color, variant) => {
  const groups = [variant?.images, color?.images, product?.images];
  for (const group of groups) {
    const images = Array.isArray(group) ? group.filter((image) => image?.url) : [];
    if (images.length) return [...new Map(images.map((image) => [image.url, image])).values()];
  }
  return [];
};

export const getVariantPrice = (product, color, variant) => {
  const current = Number(variant?.price ?? color?.price ?? product?.prices?.current ?? product?.sale_price ?? 0);
  const compare = Number(variant?.compareAtPrice ?? color?.compareAtPrice ?? product?.prices?.compareAt ?? product?.compareAtPrice ?? product?.original_price ?? 0);
  const compareAt = compare > current ? compare : null;
  return {
    current,
    compareAt,
    discount: compareAt ? Math.round(((compareAt - current) / compareAt) * 100) : 0,
  };
};

export const toCartProduct = (product, color, lens, variant, quantity = 1) => ({
  ...product,
  sale_price: Number(variant?.price ?? color?.price ?? product?.sale_price ?? 0),
  compareAtPrice: variant?.compareAtPrice ?? color?.compareAtPrice ?? product?.compareAtPrice,
  colors: color ? [{ ...color }] : [],
  lensOptionId: getLensId(lens) || null,
  lensOption: lens ? { ...lens } : null,
  selectedVariant: variant ? { ...variant } : null,
  quantiy: quantity,
  quantity,
});

export const getFirstPurchasableCartProduct = (product) => {
  const color = getInitialColor(product);
  const lens = getInitialLens(color);
  const variant = resolveVariant(product, color, lens);
  if (!color || !variant || variant.available === false) return null;
  return toCartProduct(product, color, lens, variant, 1);
};

export const formatMoney = (amount, language = "fr") => {
  const locale = language.startsWith("ar") ? "ar-MA" : language.startsWith("en") ? "en-MA" : "fr-MA";
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: Number(amount) % 1 ? 2 : 0 }).format(Number(amount) || 0)} DH`;
};

export const normalizeSwatch = (value) => {
  const raw = String(value || "").trim();
  if (/^#(?:[0-9a-f]{3}){1,2}$/i.test(raw) || /^rgb/i.test(raw)) return raw;
  const map = { black: "#111111", noir: "#111111", brown: "#70452d", marron: "#70452d", tortoise: "#80512e", ecaille: "#80512e", green: "#344c38", vert: "#344c38", gold: "#c6a45d", doré: "#c6a45d", transparent: "#eee9df", white: "#f8f8f4", gris: "#777777", gray: "#777777" };
  return map[raw.toLowerCase()] || raw || "#d6d3d1";
};
