import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ContactBenefits from "../components/Contact/ContactBenefits";
import ContactFAQ from "../components/Contact/ContactFAQ";
import ContactForm from "../components/Contact/ContactForm";
import ContactHero from "../components/Contact/ContactHero";
import ContactInfo from "../components/Contact/ContactInfo";
import ContactWhatsAppCTA from "../components/Contact/ContactWhatsAppCTA";
import { SITE_CONFIG } from "../config/site";

const CONTACT_URL = `${SITE_CONFIG.url}/contact-us`;
const CONTACT_IMAGE = `${SITE_CONFIG.url}/assets/images/contact/contact-hero.webp`;

function findOrCreateHeadElement(selector, tagName, attributes) {
  const existing = document.head.querySelector(selector);
  if (existing) return { element: existing, created: false };

  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  document.head.appendChild(element);
  return { element, created: true };
}

export default function ContactUs() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const definitions = [
      ['meta[name="description"]', "meta", { name: "description" }, "content", t("contactPage.seo.description")],
      ['meta[property="og:title"]', "meta", { property: "og:title" }, "content", t("contactPage.seo.title")],
      ['meta[property="og:description"]', "meta", { property: "og:description" }, "content", t("contactPage.seo.description")],
      ['meta[property="og:url"]', "meta", { property: "og:url" }, "content", CONTACT_URL],
      ['meta[property="og:image"]', "meta", { property: "og:image" }, "content", CONTACT_IMAGE],
      ['link[rel="canonical"]', "link", { rel: "canonical" }, "href", CONTACT_URL],
    ];
    const updates = definitions.map(([selector, tagName, attributes, attribute, value]) => {
      const { element, created } = findOrCreateHeadElement(selector, tagName, attributes);
      const previousValue = element.getAttribute(attribute);
      element.setAttribute(attribute, value);
      return { element, attribute, previousValue, created };
    });

    document.title = t("contactPage.seo.title");

    const structuredData = document.createElement("script");
    structuredData.type = "application/ld+json";
    structuredData.dataset.nazraContact = "true";
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: t("contactPage.hero.title"),
      url: CONTACT_URL,
      description: t("contactPage.seo.description"),
      mainEntity: {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        email: SITE_CONFIG.email,
        telephone: SITE_CONFIG.phone,
        areaServed: { "@type": "Country", name: "Morocco" },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: SITE_CONFIG.phone,
          email: SITE_CONFIG.email,
          contactType: "customer service",
          areaServed: "MA",
        },
      },
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
    <div className="min-h-screen bg-white text-[#171717]">
      <ContactHero />
      <section className="bg-[#fffdf9] py-5 sm:py-7" aria-label={t("contactPage.mainLabel")}>
        <div className="nazra-container grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <ContactForm />
          <ContactInfo />
        </div>
      </section>
      <ContactBenefits />
      <ContactFAQ />
      <ContactWhatsAppCTA />
    </div>
  );
}
