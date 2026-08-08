import React, { useCallback, useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import TrustBenefits from "../components/home/TrustBenefits";
import BestSellersSection from "../components/home/BestSellersSection";
import SocialProofStrip from "../components/home/SocialProofStrip";
import CommercialFilm from "../components/home/CommercialFilm";
import PromotionBanner from "../components/home/PromotionBanner";
import UserGeneratedContent from "../components/home/UserGeneratedContent";
import StyleCollections from "../components/home/StyleCollections";
import BrandStory from "../components/home/BrandStory";
import WhatsAppCTA from "../components/home/WhatsAppCTA";
import { getHomepageProducts } from "../api/api";
import usePageSeo, { canonicalUrl } from "../hooks/usePageSeo";

export const HOME_SEO_TITLE = "NAZRA | Lunettes de Soleil Homme & Femme au Maroc";
// Claims here must hold for the whole catalogue, so this stays to what the
// business itself guarantees: Moroccan brand, nationwide delivery, cash on
// delivery. Per-product features (UV400, polarised) live on product pages,
// where the product record actually proves them.
export const HOME_SEO_DESCRIPTION =
  "Lunettes de soleil NAZRA au Maroc : designs modernes pour homme et femme, paiement à la livraison et livraison partout au Maroc.";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [selectionSource, setSelectionSource] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getHomepageProducts(4);
      const payload = response?.data;
      const list = Array.isArray(payload) ? payload : payload?.products;
      setProducts(Array.isArray(list) ? list.slice(0, 4) : []);
      setSelectionSource(payload?.meta?.source === "sales" ? "sales" : "recent");
    } catch {
      setError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Explicit canonical and robots so returning from a noindex route (checkout,
  // favorites, a 404) always restores an indexable homepage head. The copy is
  // deliberately not translated: the SPA serves one URL for all three
  // languages, so the crawled description has to be stable.
  usePageSeo({
    title: HOME_SEO_TITLE,
    description: HOME_SEO_DESCRIPTION,
    canonical: canonicalUrl("/"),
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
    loadProducts();
  }, [loadProducts]);

  return (
    <>
      <HeroSection />
      <TrustBenefits />
      <BestSellersSection products={products} source={selectionSource} loading={loading} error={error} onRetry={loadProducts} />
      <SocialProofStrip />
      <CommercialFilm />
      <PromotionBanner />
      <UserGeneratedContent />
      <StyleCollections />
      <BrandStory />
      {/* ReviewsSection removed: it rendered fabricated testimonials badged
          "Vérifié" with a computed 4,8/5 aggregate, for products not in the
          catalogue. Restore it once real reviews exist — the API already
          exposes a genuine review summary per product. */}
      <WhatsAppCTA />
    </>
  );
};

export default HomePage;
