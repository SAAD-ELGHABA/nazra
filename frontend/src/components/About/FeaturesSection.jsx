import React from "react";
import { useTranslation } from "react-i18next";

const VALUES = ["identity", "style", "quality", "accessibility"];

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20" aria-labelledby="about-values-title">
      <div className="nazra-container grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex flex-col justify-center lg:ps-8">
          <p className="nazra-eyebrow">{t("about.values.eyebrow")}</p>
          <h2 id="about-values-title" className="mt-3 font-display text-[clamp(2rem,3.5vw,3.5rem)] font-semibold leading-[1.03] tracking-[-.04em] text-[#111]">
            {t("about.values.title")}
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600">{t("about.values.copy")}</p>
          <ol className="mt-7 grid grid-cols-2 border-s border-t border-stone-200">
            {VALUES.map((value, index) => (
              <li key={value} className="min-h-28 border-b border-e border-stone-200 p-4 sm:p-5">
                <span className="text-[10px] font-semibold text-[#906941]" aria-hidden="true">0{index + 1}</span>
                <h3 className="mt-2 font-display text-sm font-semibold">{t(`about.values.items.${value}.title`)}</h3>
                <p className="mt-1 text-[11px] leading-5 text-stone-600">{t(`about.values.items.${value}.copy`)}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="overflow-hidden bg-stone-100 lg:order-last">
          <img
            src="/assets/images/about/about-product-lifestyle.webp"
            alt={t("about.values.imageAlt")}
            width="1456"
            height="1092"
            loading="lazy"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
