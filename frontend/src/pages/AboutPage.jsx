import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommitmentsStrip from "../components/About/CommitmentsStrip";
import CommunitySection from "../components/About/CommunitySection";
import FeaturesSection from "../components/About/FeaturesSection";
import LuxurySection from "../components/About/LuxurySection";
import StorySection from "../components/About/StorySection";
import { SITE_CONFIG } from "../config/site";
import usePageSeo, { canonicalUrl } from "../hooks/usePageSeo";

const ABOUT_URL = canonicalUrl("/about");
const ABOUT_IMAGE = `${SITE_CONFIG.url}/assets/images/store/store-hero-desktop.webp`;

export default function AboutPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  usePageSeo({
    title: t("about.seoTitle"),
    description: t("about.seoDescription"),
    canonical: ABOUT_URL,
    image: ABOUT_IMAGE,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_CONFIG.url}/#organization`,
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
          logo: `${SITE_CONFIG.url}/nazra-icon.png`,
          email: SITE_CONFIG.email,
          sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
          brand: { "@id": `${SITE_CONFIG.url}/#brand` },
        },
        {
          "@type": "Brand",
          "@id": `${SITE_CONFIG.url}/#brand`,
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
          logo: `${SITE_CONFIG.url}/nazra-icon.png`,
          description: t("about.seoDescription"),
        },
      ],
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <LuxurySection />
      <StorySection />
      <CommitmentsStrip />
      <FeaturesSection />
      <CommunitySection />
    </div>
  );
}
