import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommitmentsStrip from "../components/About/CommitmentsStrip";
import CommunitySection from "../components/About/CommunitySection";
import FeaturesSection from "../components/About/FeaturesSection";
import LuxurySection from "../components/About/LuxurySection";
import StorySection from "../components/About/StorySection";
import { SITE_CONFIG } from "../config/site";

const ABOUT_URL = `${SITE_CONFIG.url}/about`;
const ABOUT_IMAGE = `${SITE_CONFIG.url}/assets/images/store/store-hero-desktop.webp`;

function findOrCreateHeadElement(selector, tagName, attributes) {
  const existing = document.head.querySelector(selector);
  if (existing) return { element: existing, created: false };

  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  document.head.appendChild(element);
  return { element, created: true };
}

export default function AboutPage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const definitions = [
      ['meta[name="description"]', "meta", { name: "description" }, "content", t("about.seoDescription")],
      ['meta[property="og:title"]', "meta", { property: "og:title" }, "content", t("about.seoTitle")],
      ['meta[property="og:description"]', "meta", { property: "og:description" }, "content", t("about.seoDescription")],
      ['meta[property="og:url"]', "meta", { property: "og:url" }, "content", ABOUT_URL],
      ['meta[property="og:image"]', "meta", { property: "og:image" }, "content", ABOUT_IMAGE],
      ['link[rel="canonical"]', "link", { rel: "canonical" }, "href", ABOUT_URL],
    ];
    const updates = definitions.map(([selector, tagName, attributes, attribute, value]) => {
      const { element, created } = findOrCreateHeadElement(selector, tagName, attributes);
      const previousValue = element.getAttribute(attribute);
      element.setAttribute(attribute, value);
      return { element, attribute, previousValue, created };
    });

    document.title = t("about.seoTitle");

    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.dataset.nazraAbout = "true";
    structuredData.textContent = JSON.stringify({
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
    });
    document.head.appendChild(structuredData);

    return () => {
      document.title = previousTitle;
      updates.forEach(({ element, attribute, previousValue, created }) => {
        if (created) element.remove();
        else if (previousValue === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, previousValue);
      });
      structuredData.remove();
    };
  }, [i18n.resolvedLanguage, t]);

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
