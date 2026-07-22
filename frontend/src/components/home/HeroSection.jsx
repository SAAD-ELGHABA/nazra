import React from "react";
import { Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="nazra-hero relative isolate min-h-[480px] overflow-hidden bg-stone-800 sm:min-h-[560px] lg:min-h-[600px]" aria-labelledby="hero-title">
      <img
        src="/assets/images/home/hero-nazra.webp"
        alt="Deux modèles portant des lunettes de soleil NAZRA à Marrakech"
        width="1672"
        height="941"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent sm:from-black/55 sm:via-black/15" />
      <div className="nazra-container relative flex min-h-[480px] items-center sm:min-h-[560px] lg:min-h-[600px]">
        <div className="max-w-[600px] py-16 text-white">
          <h1 id="hero-title" className="font-display text-[clamp(3.25rem,7vw,6.6rem)] font-black uppercase leading-[.83] tracking-[-.055em]">
            {t("home.hero.title")}
          </h1>
          <p className="mt-5 max-w-[500px] text-sm leading-6 text-white/90 sm:text-lg sm:leading-7">
            {t("home.hero.copy")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/store/products?category=Men" className="nazra-button bg-white text-black hover:bg-stone-100">
              {t("home.hero.men")}
            </Link>
            <Link to="/store/products?category=Women" className="nazra-button border border-white bg-transparent text-white hover:bg-white hover:text-black">
              {t("home.hero.women")}
            </Link>
          </div>
          <p className="mt-9 flex items-center gap-2 text-xs font-medium tracking-wide text-white/90">
            <Sun size={18} aria-hidden="true" /> {t("home.hero.signature")}
          </p>
        </div>
      </div>
    </section>
  );
}
