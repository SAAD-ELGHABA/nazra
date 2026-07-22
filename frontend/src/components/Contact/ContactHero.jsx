import React from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactHero() {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden bg-[#f5ede1]" aria-labelledby="contact-title">
      <div className="mx-auto grid w-full max-w-[1440px] lg:min-h-[235px] lg:grid-cols-[.46fr_.54fr]">
        <div className="flex items-center px-5 py-10 sm:px-8 lg:px-12 lg:py-8 xl:px-20">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#9a6e3b]">
              <Sparkles size={12} aria-hidden="true" /> {t("contactPage.hero.eyebrow")}
            </p>
            <h1 id="contact-title" className="mt-3 font-display text-[2.25rem] font-medium leading-[1.03] tracking-[-.035em] sm:text-5xl">
              {t("contactPage.hero.title")}
            </h1>
            <p className="mt-4 max-w-lg text-[12px] leading-5 text-stone-700 sm:text-[13px]">
              {t("contactPage.hero.copy")}
            </p>
          </div>
        </div>
        <div className="relative min-h-[220px] sm:min-h-[285px] lg:min-h-full">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-10 hidden w-24 bg-gradient-to-r from-[#f5ede1] to-transparent lg:block rtl:bg-gradient-to-l" aria-hidden="true" />
          <img
            src="/assets/images/contact/contact-hero.webp"
            alt={t("contactPage.hero.imageAlt")}
            width="1600"
            height="700"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
