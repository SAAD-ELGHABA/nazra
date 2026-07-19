import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const STYLES = [
  { key: "minimal", href: "/store/products?type=Rectangle", position: "object-left" },
  { key: "bold", href: "/store/products?type=Oversized", position: "object-center" },
  { key: "polarized", href: "/store/products?type=Polarized", position: "object-right" },
];

export default function StyleCollections() {
  const { t } = useTranslation();
  return (
    <section className="nazra-container pb-14" aria-labelledby="styles-title">
      <h2 id="styles-title" className="sr-only">{t("home.styles.title")}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {STYLES.map((style, index) => (
          <Link key={style.key} to={style.href} className={`group relative isolate min-h-44 overflow-hidden rounded-sm ${index === 0 ? "bg-[#eee9e2]" : index === 1 ? "bg-[#eac7ae]" : "bg-[#dedfd0]"}`}>
            <img src="/assets/images/home/promotion-sandstone.webp" alt="" width="720" height="360" loading="lazy" className={`absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105 ${style.position}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/35 to-transparent" />
            <div className="relative flex min-h-44 max-w-52 flex-col justify-center p-6">
              <h3 className="font-display text-2xl font-semibold">{t(`home.styles.${style.key}.title`)}</h3>
              <p className="mt-1 text-[11px] text-stone-600">{t(`home.styles.${style.key}.copy`)}</p>
              <span className="mt-4 flex items-center gap-1 text-[11px] font-semibold underline underline-offset-4">{t("home.styles.discover")} <ArrowRight size={13} className="rtl:rotate-180" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
