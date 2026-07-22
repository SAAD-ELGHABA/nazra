import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getSingleProduct, trackVisitPerProduct } from "../api/api";
import { useCard } from "../context/CardContext";
import { useFavorites } from "../context/FavoritesContext";
import { SITE_CONFIG } from "../config/site";
import ProductBreadcrumbs from "../components/ProductDetails/ProductBreadcrumbs";
import ProductGallery from "../components/ProductDetails/ProductGallery";
import ProductInfo from "../components/ProductDetails/ProductInfo";
import ProductTrustCard from "../components/ProductDetails/ProductTrustCard";
import ProductInfoTabs from "../components/ProductDetails/ProductInfoTabs";
import ProductReviews from "../components/ProductDetails/ProductReviews";
import RelatedProducts from "../components/ProductDetails/RelatedProducts";
import ProductWhatsAppCTA from "../components/ProductDetails/ProductWhatsAppCTA";
import { getGalleryImages, getInitialColor, getInitialLens, getLocalizedText, resolveVariant, toCartProduct } from "../components/ProductDetails/productUtils";

const setMeta = (attribute, value, content) => {
  let tag = document.head.querySelector(`meta[${attribute}="${value}"]`);
  const created = !tag;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }
  const previousContent = tag.getAttribute("content");
  tag.setAttribute("content", content);
  return { tag, created, previousContent };
};

const ProductSkeleton = ({ label }) => <main className="nazra-container py-8" aria-busy="true" aria-label={label}><span className="sr-only">{label}</span><div className="grid animate-pulse gap-8 lg:grid-cols-[1.45fr_.75fr]"><div className="grid gap-3 sm:grid-cols-[76px_1fr]"><div className="hidden space-y-3 sm:block">{[1, 2, 3, 4].map((value) => <div key={value} className="h-20 rounded bg-stone-200" />)}</div><div className="aspect-[1.25] rounded bg-stone-200" /></div><div><div className="h-14 w-2/3 bg-stone-200" /><div className="mt-5 h-5 w-1/2 bg-stone-200" /><div className="mt-5 h-20 bg-stone-100" /><div className="mt-8 h-12 bg-stone-200" /></div></div></main>;

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCard } = useCard();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const reviewsRef = useRef(null);
  const [state, setState] = useState({ status: "loading", product: null });
  const [color, setColor] = useState(null);
  const [lens, setLens] = useState(null);
  const language = i18n.resolvedLanguage || i18n.language;

  useEffect(() => {
    const controller = new AbortController();
    window.scrollTo({ top: 0, behavior: "auto" });
    setState({ status: "loading", product: null });
    getSingleProduct(slug, controller.signal)
      .then((response) => {
        const product = response?.data?.product;
        if (!product) {
          setState({ status: "notfound", product: null });
          return;
        }
        const initialColor = getInitialColor(product);
        setColor(initialColor);
        setLens(getInitialLens(initialColor));
        setState({ status: "success", product });
        if (product._id) trackVisitPerProduct(product._id).catch(() => {});
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        setState({ status: error?.response?.status === 404 ? "notfound" : "error", product: null });
      });
    return () => controller.abort();
  }, [slug]);

  const product = useMemo(() => state.product ? {
    ...state.product,
    shortDescriptionText: getLocalizedText(state.product.shortDescription, language),
    descriptionText: getLocalizedText(state.product.description, language),
  } : null, [state.product, language]);
  const variant = useMemo(() => resolveVariant(product, color, lens), [product, color, lens]);
  const images = useMemo(() => getGalleryImages(product, color, variant), [product, color, variant]);

  useEffect(() => {
    if (!product) return undefined;
    const previousTitle = document.title;
    const canonicalUrl = `${SITE_CONFIG.url}/product/${encodeURIComponent(product.slug)}`;
    const description = product.shortDescriptionText || t("productDetails.shareDescription", { name: product.name });
    const image = images[0]?.url || product.seo?.image || "";
    document.title = `${product.name} | NAZRA`;
    const metaUpdates = [
      setMeta("name", "description", description),
      setMeta("property", "og:type", "product"),
      setMeta("property", "og:title", `${product.name} | NAZRA`),
      setMeta("property", "og:description", description),
      setMeta("property", "og:url", canonicalUrl),
      ...(image ? [setMeta("property", "og:image", image)] : []),
      setMeta("name", "twitter:card", "summary_large_image"),
      setMeta("name", "twitter:title", `${product.name} | NAZRA`),
      setMeta("name", "twitter:description", description),
      ...(image ? [setMeta("name", "twitter:image", image)] : []),
    ];
    let canonical = document.head.querySelector('link[rel="canonical"]');
    const canonicalCreated = !canonical;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    const previousCanonical = canonical.getAttribute("href");
    canonical.href = canonicalUrl;
    const price = Number(variant?.price ?? product.prices?.current ?? product.sale_price ?? 0);
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product", name: product.name, description, image: images.map((item) => item.url), ...(variant?.sku || product.references ? { sku: variant?.sku || product.references } : {}), brand: { "@type": "Brand", name: SITE_CONFIG.name }, offers: { "@type": "Offer", url: canonicalUrl, priceCurrency: "MAD", price, availability: variant?.available === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition" }, ...(product.rating?.count > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count } } : {})
        },
        {
          "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: t("productDetails.home"), item: SITE_CONFIG.url },
            { "@type": "ListItem", position: 2, name: product.gender || product.category || t("productDetails.catalog"), item: `${SITE_CONFIG.url}/store/products` },
            { "@type": "ListItem", position: 3, name: product.name, item: canonicalUrl }
          ]
        }
      ]
    };
    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.dataset.nazraProduct = "true";
    jsonLd.text = JSON.stringify(schema);
    document.head.appendChild(jsonLd);
    return () => {
      document.title = previousTitle;
      metaUpdates.forEach(({ tag, created, previousContent }) => {
        if (created) tag.remove();
        else if (previousContent === null) tag.removeAttribute("content");
        else tag.setAttribute("content", previousContent);
      });
      if (canonicalCreated) canonical.remove();
      else if (previousCanonical === null) canonical.removeAttribute("href");
      else canonical.setAttribute("href", previousCanonical);
      jsonLd.remove();
    };
  }, [product, variant, images, t]);

  const changeColor = (nextColor) => {
    setColor(nextColor);
    setLens(getInitialLens(nextColor));
  };
  const cartProduct = (quantity) => toCartProduct(product, color, lens, variant, quantity);
  const validateSelection = () => {
    if (!color || !variant || variant.available === false) {
      toast.error(t("productDetails.unavailableCombination"));
      return false;
    }
    return true;
  };
  const add = (quantity) => {
    if (!validateSelection()) return;
    addToCard(cartProduct(quantity));
    toast.success(t("productDetails.added", { name: product.name }));
  };
  const buyNow = (quantity) => {
    if (!validateSelection()) return;
    addToCard(cartProduct(quantity), { showConfirmation: false });
    navigate("/checkout-card");
  };
  const toggleFavorite = () => {
    const id = product?._id || product?.id;
    if (isFavorite(id)) removeFavorite(id); else addFavorite(product);
  };

  if (state.status === "loading") return <ProductSkeleton label={t("productDetails.loading")} />;
  if (state.status === "error" || state.status === "notfound") return <main className="nazra-container grid min-h-[55vh] place-items-center py-16 text-center"><div><AlertCircle className="mx-auto h-8 w-8 text-stone-400" /><h1 className="mt-4 font-display text-3xl font-semibold">{t(state.status === "notfound" ? "productDetails.notFoundTitle" : "productDetails.errorTitle")}</h1><p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{t(state.status === "notfound" ? "productDetails.notFoundCopy" : "productDetails.errorCopy")}</p>{state.status === "notfound" ? <Link to="/store/products" className="mt-6 inline-flex min-h-11 items-center bg-black px-6 text-xs font-semibold text-white">{t("productDetails.discover")}</Link> : <button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 bg-black px-6 text-xs font-semibold text-white">{t("productDetails.retry")}</button>}</div></main>;

  const rawBadge = product.badges?.[0];
  const badge = rawBadge ? (/best/i.test(rawBadge) ? t("productDetails.bestSeller") : /new|nouveau/i.test(rawBadge) ? t("productDetails.new") : rawBadge) : variant?.stockStatus === "low_stock" ? t("productDetails.limited") : null;
  return (
    <main className="bg-white text-[#151515]">
      <ProductBreadcrumbs product={product} />
      <div className="nazra-container grid min-w-0 gap-7 pb-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,.72fr)] xl:grid-cols-[minmax(0,1.35fr)_minmax(350px,.72fr)_220px] xl:gap-9">
        <ProductGallery name={product.name} images={images} badge={badge} />
        <ProductInfo key={`${color?._id || color?.id || "none"}-${lens?._id || lens?.id || "none"}`} product={product} color={color} lens={lens} variant={variant} onColorChange={changeColor} onLensChange={setLens} onAdd={add} onBuyNow={buyNow} favorite={isFavorite(product._id || product.id)} onFavorite={toggleFavorite} reviewsRef={reviewsRef} />
        <div className="lg:col-span-2 xl:col-span-1"><ProductTrustCard /></div>
      </div>
      <div className="border-y border-stone-200 bg-[#fffefa]"><div className="nazra-container grid gap-8 py-6 lg:grid-cols-[.82fr_1.55fr] lg:gap-10"><ProductInfoTabs product={product} /><ProductReviews slug={product.slug} rating={product.rating} sectionRef={reviewsRef} /></div></div>
      <RelatedProducts products={product.relatedProducts} />
      <ProductWhatsAppCTA product={product} color={color} lens={lens} />
    </main>
  );
}
