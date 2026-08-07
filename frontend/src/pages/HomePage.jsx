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
import ReviewsSection from "../components/home/ReviewsSection";
import WhatsAppCTA from "../components/home/WhatsAppCTA";
import { getHomepageProducts } from "../api/api";

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

  useEffect(() => {
    document.title = "NAZRA | Lunettes de Soleil Homme & Femme au Maroc";
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
      <ReviewsSection />
      <WhatsAppCTA />
    </>
  );
};

export default HomePage;
