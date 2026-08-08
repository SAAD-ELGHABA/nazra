import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getSingleProduct, trackVisitPerProduct } from "../api/api";
import { useCard } from "../context/CardContext";
import { useFavorites } from "../context/FavoritesContext";
import { useConsent } from "../context/ConsentContext";
import ProductBreadcrumbs from "../components/ProductDetails/ProductBreadcrumbs";
import ProductGallery from "../components/ProductDetails/ProductGallery";
import ProductInfo from "../components/ProductDetails/ProductInfo";
import ProductTrustCard from "../components/ProductDetails/ProductTrustCard";
import ProductInfoTabs from "../components/ProductDetails/ProductInfoTabs";
import ProductReviews from "../components/ProductDetails/ProductReviews";
import RelatedProducts from "../components/ProductDetails/RelatedProducts";
import ProductWhatsAppCTA from "../components/ProductDetails/ProductWhatsAppCTA";
import { getGalleryImages, getInitialColor, getInitialLens, getLocalizedText, resolveVariant, toCartProduct } from "../components/ProductDetails/productUtils";
import { buildProductJsonLd, productCanonicalUrl, productSeoImage } from "../components/ProductDetails/productSeo";
import usePageSeo, { ROBOTS_NOINDEX } from "../hooks/usePageSeo";
import { track } from "../utils/tagLoader";

const ProductSkeleton = ({ label }) => <main className="nazra-container py-8" aria-busy="true" aria-label={label}><span className="sr-only">{label}</span><div className="grid animate-pulse gap-8 lg:grid-cols-[1.45fr_.75fr]"><div className="grid gap-3 sm:grid-cols-[76px_1fr]"><div className="hidden space-y-3 sm:block">{[1, 2, 3, 4].map((value) => <div key={value} className="h-20 rounded bg-stone-200" />)}</div><div className="aspect-[1.25] rounded bg-stone-200" /></div><div><div className="h-14 w-2/3 bg-stone-200" /><div className="mt-5 h-5 w-1/2 bg-stone-200" /><div className="mt-5 h-20 bg-stone-100" /><div className="mt-8 h-12 bg-stone-200" /></div></div></main>;

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCard } = useCard();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { categories } = useConsent();
  const reviewsRef = useRef(null);
  const [state, setState] = useState({ status: "loading", product: null });
  const [color, setColor] = useState(null);
  const [lens, setLens] = useState(null);
  const language = i18n.resolvedLanguage || i18n.language;

  // Held in a ref so a consent change never re-triggers the product fetch; the
  // value is read at the moment the view would be recorded.
  const analyticsConsent = useRef(categories.analytics);
  useEffect(() => {
    analyticsConsent.current = categories.analytics;
  }, [categories.analytics]);

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
        if (product._id && analyticsConsent.current) trackVisitPerProduct(product._id).catch(() => {});
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

  // A product only becomes indexable once the API has confirmed it exists. The
  // loading, error and 404 states stay `noindex` so a missing product never
  // publishes a canonical URL or Product markup.
  const seo = useMemo(() => {
    const canonical = product ? productCanonicalUrl(product.slug) : null;
    if (!product || !canonical) {
      const failed = state.status === "notfound" || state.status === "error";
      return {
        // While the request is still in flight the document keeps its title;
        // only a resolved failure renames the page.
        ...(failed
          ? { title: `${t(state.status === "notfound" ? "productDetails.notFoundTitle" : "productDetails.errorTitle")} | NAZRA` }
          : {}),
        robots: ROBOTS_NOINDEX,
      };
    }

    const description = product.shortDescriptionText
      || product.descriptionText?.slice(0, 300)
      || t("productDetails.shareDescription", { name: product.name });

    return {
      title: `${product.name} | NAZRA`,
      description,
      canonical,
      image: productSeoImage(images, product),
      type: "product",
      jsonLd: buildProductJsonLd({
        product,
        variant,
        images,
        description,
        homeLabel: t("productDetails.home"),
        catalogLabel: product.gender || product.category || t("productDetails.catalog"),
      }),
    };
  }, [product, variant, images, state.status, t]);

  usePageSeo(seo);

  // Fires once per product, after the API confirms it exists. Keyed on the id
  // rather than the object so re-renders and variant switches do not re-report
  // the same view.
  useEffect(() => {
    if (state.status !== "success" || !product?._id) return;
    track("view_item", {
      currency: "MAD",
      value: Number(product.prices?.current ?? product.sale_price ?? 0),
      items: [{
        item_id: product._id,
        item_name: product.name,
        price: Number(product.prices?.current ?? product.sale_price ?? 0),
        quantity: 1,
      }],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, product?._id]);

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
  /** Ecommerce event payload for the current selection. */
  const trackingPayload = (quantity) => ({
    currency: "MAD",
    value: Number(variant?.price ?? product?.prices?.current ?? product?.sale_price ?? 0) * quantity,
    items: [{
      item_id: variant?.sku || product?._id,
      item_name: product?.name,
      item_variant: color?.name,
      price: Number(variant?.price ?? product?.prices?.current ?? product?.sale_price ?? 0),
      quantity,
    }],
  });

  const add = (quantity) => {
    if (!validateSelection()) return;
    addToCard(cartProduct(quantity));
    track("add_to_cart", trackingPayload(quantity));
    toast.success(t("productDetails.added", { name: product.name }));
  };
  const buyNow = (quantity) => {
    if (!validateSelection()) return;
    addToCard(cartProduct(quantity), { showConfirmation: false });
    track("add_to_cart", trackingPayload(quantity));
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
