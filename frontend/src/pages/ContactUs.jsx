import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ContactBenefits from "../components/Contact/ContactBenefits";
import ContactFAQ from "../components/Contact/ContactFAQ";
import ContactForm from "../components/Contact/ContactForm";
import ContactHero from "../components/Contact/ContactHero";
import ContactInfo from "../components/Contact/ContactInfo";
import ContactWhatsAppCTA from "../components/Contact/ContactWhatsAppCTA";
import { SITE_CONFIG } from "../config/site";
import usePageSeo, { canonicalUrl } from "../hooks/usePageSeo";

const CONTACT_URL = canonicalUrl("/contact-us");
const CONTACT_IMAGE = `${SITE_CONFIG.url}/assets/images/contact/contact-hero.webp`;

export default function ContactUs() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  usePageSeo({
    title: t("contactPage.seo.title"),
    description: t("contactPage.seo.description"),
    canonical: CONTACT_URL,
    image: CONTACT_IMAGE,
    jsonLd: {
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
    },
  });

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
