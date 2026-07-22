import React from "react";
import { useTranslation } from "react-i18next";

export default function LuxurySection() {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden bg-[#eee5d8]" aria-labelledby="about-hero-title">
      <div className="grid w-full lg:min-h-[360px] lg:grid-cols-[42%_58%]">
        <div className="flex items-center px-5 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-10 xl:px-20">
          <div className="max-w-[520px]">
            <p className="nazra-eyebrow mb-3">{t("about.hero.eyebrow")}</p>
            <h1 id="about-hero-title" className="font-display text-[clamp(2.5rem,4vw,4.25rem)] font-semibold leading-[.98] tracking-[-.045em] text-[#111]">
              {t("about.hero.title")}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-stone-700 sm:text-[15px]">
              {t("about.hero.copy")}
            </p>
          </div>
        </div>
        <div className="min-h-[300px] sm:min-h-[360px] lg:min-h-full">
          <img
            src="/assets/images/store/store-hero-desktop.webp"
            alt={t("about.hero.imageAlt")}
            width="1990"
            height="793"
            fetchPriority="high"
            className="h-full w-full object-cover object-[70%_center]"
          />
        </div>
      </div>
    </section>
  );
}
