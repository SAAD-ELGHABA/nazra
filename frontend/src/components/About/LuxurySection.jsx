import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function LuxurySection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 gap-6 items-center justify-center">
      <div className="flex flex-col gap-8">
        <h1
          className="font-bold text-[28px] md:text-left md:text-[56px]"
          style={{ lineHeight: "1.2", letterSpacing: "4px" , textShadow:'4px 2px 4px black'}}
        >
          {t("luxury.title")}
        </h1>
        <p>{t("luxury.subtitle")}</p>
        <div>
          <Link
            to="/shop"
            className="px-6 py-3 text-white rounded transition-colors duration-300 hover:bg-white border border-black hover:shadow-none bg-black hover:text-black text-center shadow-md shadow-black/50"
          >
            {t("luxury.exploreButton")}
          </Link>
        </div>
      </div>
      <div>
        <img
          src="/About/luxury-img.png"
          alt="luxury-img"
          loading="lazy"
          className="max-w-full h-auto shadow-md shadow-black/50 "
        />
      </div>
    </div>
  );
}

export default LuxurySection;
