import React from "react";
import { useTranslation } from "react-i18next";

export default function StoreHero() {
  const { t } = useTranslation();
  return (
    <section className="store-hero relative isolate min-h-[210px] overflow-hidden bg-[#eee8df] sm:min-h-[250px] lg:min-h-[270px]">
      <img src="/assets/images/store/store-hero-desktop.webp" alt="" width="1536" height="640" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f1ece5] via-[#f1ece5]/80 to-transparent rtl:bg-gradient-to-l" />
      <div className="nazra-container relative flex min-h-[210px] items-center sm:min-h-[250px] lg:min-h-[270px]">
        <div className="max-w-[390px] py-9 sm:py-12">
          <h1 className="font-display text-[34px] font-semibold leading-tight tracking-[-.035em] text-[#101010] sm:text-[42px] lg:text-[46px]">{t("store.heroTitle")}</h1>
          <p className="mt-4 max-w-[300px] text-sm leading-6 text-stone-700 sm:text-[15px]">{t("store.heroCopy")}</p>
        </div>
      </div>
    </section>
  );
}
