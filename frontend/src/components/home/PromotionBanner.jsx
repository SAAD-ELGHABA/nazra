import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SITE_CONFIG } from "../../config/site";

export default function PromotionBanner() {
  const { t } = useTranslation();
  const promotion = SITE_CONFIG.promotion;
  const title = promotion.enabled ? t(promotion.titleKey) : t("home.promotion.editorialTitle");
  const description = promotion.enabled ? t(promotion.descriptionKey) : t("home.promotion.editorialDescription");
  const href = promotion.enabled ? promotion.href : "/store/products";

  return (
    <section className="nazra-container pb-7">
      <div className="relative isolate min-h-56 overflow-hidden rounded-sm bg-stone-900 sm:min-h-64">
        <img src="/assets/images/home/promotion-sandstone.webp" alt="Lunettes de soleil NAZRA sur un décor minéral" width="1774" height="554" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative flex min-h-56 max-w-xl flex-col items-start justify-center p-7 text-white sm:min-h-64 sm:p-12">
          <h2 className="font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm text-white/85">{description}</p>
          <Link to={href} className="mt-6 inline-flex items-center gap-2 bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-stone-200">{t("home.promotion.cta")} <ArrowRight size={15} className="rtl:rotate-180" /></Link>
        </div>
      </div>
    </section>
  );
}
